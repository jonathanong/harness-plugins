import datetime, json, unittest

from fakegh import Fail, FakeGh, ghlib, run
import extras, report

NOW = datetime.datetime(2026, 11, 24, 12, tzinfo=datetime.timezone.utc)
RATE = {"resources": {"core": {"remaining": 5, "limit": 10}, "graphql": {"remaining": 7, "limit": 9}}}


def wf_run(id_, event="push", conclusion="success", **extra):
    base = {"id": id_, "name": "CI", "event": event, "status": "completed", "conclusion": conclusion,
            "head_branch": "main", "created_at": "2026-11-24T10:00:00Z",
            "run_started_at": "2026-11-24T10:01:00Z", "updated_at": "2026-11-24T10:11:00Z"}
    return {**base, **extra}


RUNS = [
    wf_run(1, run_attempt=2),
    wf_run(2, conclusion="failure"),
    wf_run(3, event="merge_group", conclusion="failure", head_branch="gh-readonly-queue/main/pr-7-abc"),
    wf_run(4, status="in_progress", conclusion=None, updated_at=None),
]
JOBS = {"jobs": [
    {"name": "build", "labels": ["ubuntu-latest"], "conclusion": "success", "created_at": "2026-11-24T10:00:30Z",
     "started_at": "2026-11-24T10:01:00Z", "completed_at": "2026-11-24T10:05:00Z"},
    {"name": "test", "labels": ["macos-15"], "conclusion": "failure", "steps": [{"name": "unit", "conclusion": "failure"}],
     "started_at": "2026-11-24T10:01:00Z", "completed_at": "2026-11-24T10:03:00Z"},
    {"name": "test", "labels": ["macos-15"], "conclusion": "failure", "steps": [{"name": "unit", "conclusion": "failure"}],
     "started_at": "2026-11-24T10:01:00Z", "completed_at": "2026-11-24T10:02:00Z"},
    {"name": "lint", "labels": ["windows-latest", "x64"], "conclusion": "failure",
     "started_at": "2026-11-24T10:01:00Z", "completed_at": "2026-11-24T10:02:00Z"},
    {"name": "docs", "labels": [], "conclusion": "skipped", "started_at": None, "completed_at": None},
]}
RULES = [{"type": "required_status_checks", "parameters": {"required_status_checks": [{"context": "ci"}]}},
         {"type": "deletion", "parameters": {}}]


def routes(**override):
    table = {
        "rate": ("GET", "rate_limit", RATE),
        "push": ("GET", "event=push", {"workflow_runs": [r for r in RUNS if r["event"] == "push"], "total_count": 3}),
        "queue": ("GET", "event=merge_group", {"workflow_runs": [RUNS[2]], "total_count": 1}),
        "jobs": ("GET", "/jobs?filter=latest", JOBS),
        "rules": ("GET", "rules/branches/main", RULES),
        "pulls": ("GET", "pulls?state=all", [{"number": 7, "draft": True}]),
        "repo": ("GET", "=repos/o/r", {"default_branch": "main"}),
    }
    table.update(override)
    return list(table.values())


class Main(unittest.TestCase):
    def test_text_report(self):
        out, code, _ = run(report.main, ["--repo", "o/r", "--events", "push,merge_group"], routes(), NOW)
        self.assertIsNone(code)
        lines = out.splitlines()
        self.assertTrue(lines[0].startswith("report o/r since=2026-11-17T12:00:00Z runs=4 jobsSample=3"))
        self.assertIn("wf CI push n=3 wall p50=10.0m p90=10.0m max=10.0m start p50=60s p90=60s "
                      "failure=1 in_progress=1 success=1 cancel%=0%", lines)
        self.assertIn("job CI/test runner=macos-15 n=6 skipped=0 median=60s max=2.0m total=9.0m fail=6 "
                      "queue median=- max=-", lines)
        self.assertIn("job CI/build runner=ubuntu-latest n=3 skipped=0 median=4.0m max=4.0m total=12.0m fail=0 "
                      "queue median=30s max=30s", lines)
        self.assertIn("jobs-skipped-only 3 (hidden; see --json)", lines)
        self.assertIn("runner macos-15 min=9 x10 billed=90", lines)
        self.assertIn("runner windows-latest,x64 min=3 x2 billed=6", lines)
        self.assertIn("fail test > unit n=6 runs=2,3,1", lines)
        self.assertIn("fail lint > - n=3 runs=2,3,1", lines)
        self.assertIn("eject PR#7 n=1 runs=3", lines)
        self.assertIn("rerun-success CI=1", lines)
        self.assertIn("required-by-rulesets ci", lines)
        self.assertIn("draft-vs-ready none", lines)
        self.assertIn("rate before core=5/10 graphql=7/9", lines)
        self.assertIn("rate after core=5/10 graphql=7/9", lines)

    def test_json_and_truncation(self):
        argv = ["--repo", "o/r", "--events", "push", "--max-runs", "2", "--json"]
        out, code, _ = run(report.main, argv, routes(rules=("GET", "rules/branches/main", Fail(403))), NOW)
        self.assertIsNone(code)
        data = json.loads(out)
        self.assertEqual(data["runs"], 2)
        self.assertIsNone(data["requiredChecks"])
        self.assertEqual(data["truncated"], ["runs push: limit 2 reached (fetched 2 of 3)", "rules: gh: failed (HTTP 403)"])

    def test_call_cap_while_sampling_jobs(self):
        argv = ["--repo", "o/r", "--events", "push", "--max-calls", "3"]
        out, code, _ = run(report.main, argv, routes(), NOW)
        self.assertIsNone(code)
        self.assertIn("truncated jobs run 1: api-call cap 3 reached", out)
        self.assertIn("truncated enrichment: api-call cap 3 reached", out)
        self.assertIn("required-by-rulesets unavailable", out)
        self.assertNotIn("rate after", out)

    def test_empty_events(self):
        _, code, _ = run(report.main, ["--repo", "o/r", "--events", ","], [], NOW)
        self.assertEqual(code, "github-ci-operations: --events is empty")

    def test_api_error(self):
        _, code, _ = run(report.main, ["--repo", "o/r"], routes(rate=("GET", "rate_limit", Fail(500))), NOW)
        self.assertEqual(code, "github-ci-operations: o/r: gh: failed (HTTP 500)")

    def test_default_clock(self):
        out, code, _ = run(report.main, ["--repo", "o/r", "--events", "push"], routes(), None)
        self.assertIsNone(code)
        self.assertTrue(out.startswith("report o/r"))


class Parts(unittest.TestCase):
    def test_multiplier(self):
        self.assertEqual([report.multiplier(x) for x in ("macos-15", "windows-latest", "ubuntu", None)], [10, 2, 1, 1])

    def test_sample_takes_failures_first(self):
        runs = [wf_run(i, conclusion="failure" if i < 3 else "success", created_at=f"2026-11-24T1{i}:00:00Z")
                for i in range(6)]
        self.assertEqual([r["id"] for r in report.sample(runs, 4)], [2, 1, 5, 4])

    def test_draft_split(self):
        runs = [wf_run(1, event="pull_request", pull_requests=[{"number": 1}]),
                wf_run(2, event="pull_request", pull_requests=[{"number": 2}]),
                wf_run(3, event="pull_request", pull_requests=[{"number": 3}]),
                wf_run(4, event="pull_request"), wf_run(5)]
        self.assertEqual(extras.draft_split(runs, {1: True, 2: False}), {"draft": 1, "ready": 1, "unknown": 2})

    def test_enrich_keeps_going_when_pulls_are_forbidden(self):
        out = {"truncated": []}
        with FakeGh(routes(pulls=("GET", "pulls?state=all", Fail(403)))).patch():
            extras.enrich(ghlib.Gh(10), "o/r", [wf_run(1, event="pull_request")], out)
        self.assertEqual(out["truncated"], ["pulls (draft state): gh: failed (HTTP 403)"])
        self.assertEqual(out["draftRuns"], {"unknown": 1})
        self.assertIsNotNone(out["rateAfter"])

    def test_enrich_stops_at_the_cap(self):
        out = {"truncated": []}
        with FakeGh(routes()).patch():
            extras.enrich(ghlib.Gh(2), "o/r", [], out)
        self.assertEqual(out["requiredChecks"], ["ci"])
        self.assertEqual(out["truncated"], ["pulls (draft state): api-call cap 2 reached",
                                            "enrichment: api-call cap 2 reached"])


if __name__ == "__main__":
    unittest.main()
