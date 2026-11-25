import datetime, unittest

from fakegh import Fail, Seq, run
import stale

NOW = datetime.datetime(2026, 11, 24, 12, tzinfo=datetime.timezone.utc)
TWELVE_HOURS_AGO = "2026-11-24T00:00:00Z"


def stuck_run(id_, status="queued", created=TWELVE_HOURS_AGO, branch="feature", **extra):
    return {"id": id_, "name": "CI", "event": "push", "status": status, "created_at": created,
            "head_branch": branch, **extra}


QUEUED = [
    stuck_run(11, pull_requests=[{"number": 5}]),
    stuck_run(13, created="2026-11-20T00:00:00Z", branch="x"),
    stuck_run(14, branch="main"),
    stuck_run(15, created="2026-11-24T11:30:00Z"),
    stuck_run(16, created=None),
    stuck_run(17, branch=None),
    stuck_run(18),
    stuck_run(19),
    stuck_run(20),
]
IN_PROGRESS = [stuck_run(12, status="in_progress", created="2026-11-20T00:00:00Z",
                         run_started_at="2026-11-23T00:00:00Z", branch="gh-readonly-queue/main/pr-9-x")]


def runs_route(status, runs):
    return ("GET", f"actions/runs?status={status}", {"workflow_runs": runs, "total_count": len(runs)})


def routes(*extra):
    queued = {r["id"]: r for r in QUEUED}
    return [
        *extra,
        ("GET", "=repos/o/r", {"default_branch": "main"}),
        runs_route("queued", QUEUED),
        runs_route("in_progress", IN_PROGRESS),
        runs_route("", []),
        ("POST", "runs/11/cancel", None),
        ("POST", "runs/12/cancel", Fail(409)),
        ("GET", "runs/12/jobs", {"jobs": [{"id": 1}]}),
        ("POST", "runs/12/force-cancel", None),
        ("GET", "=repos/o/r/actions/runs/12", IN_PROGRESS[0]),
        ("POST", "runs/13/cancel", Fail(409)),
        ("GET", "runs/13/jobs", {"jobs": []}),
        ("POST", "runs/17/cancel", Fail(500)),
        ("GET", "=repos/o/r/actions/runs/18", {**queued[18], "status": "completed"}),
        ("POST", "runs/19/cancel", Fail(409)),
        ("GET", "runs/19/jobs", {"jobs": [{"id": 1}]}),
        ("POST", "runs/19/force-cancel", Fail(500)),
        ("POST", "runs/20/cancel", Fail(409)),
        ("GET", "=repos/o/r/actions/runs/20", Seq(queued[20], {**queued[20], "status": "completed"})),
        *[("GET", f"=repos/o/r/actions/runs/{i}", run_) for i, run_ in queued.items()],
    ]


class Main(unittest.TestCase):
    def test_cancels_stuck_runs_and_never_the_default_branch(self):
        out, code, fake = run(stale.main, ["--repo", "o/r"], routes(), NOW)
        self.assertIsNone(code)
        lines = out.splitlines()
        self.assertEqual(lines[0], "stale o/r older-than=6h status=queued,in_progress,waiting,pending n=7 mode=cancel")
        self.assertIn("11 CI push PR#5 queued 12.0h -> cancelled", lines)
        self.assertIn("12 CI push PR#9(queue) in_progress 36.0h -> force-cancelled", lines)
        self.assertIn("17 CI push - queued 12.0h -> failed HTTP 500", lines)
        self.assertIn("18 CI push feature queued 12.0h -> left alone: now completed", lines)
        self.assertIn("19 CI push feature queued 12.0h -> force-cancel failed HTTP 500", lines)
        self.assertIn("20 CI push feature queued 12.0h -> left alone: now completed", lines)
        self.assertIn("never-started n=1 oldest=4.5d ids=13 (cannot be cancelled or deleted via the API; "
                      "ask GitHub Support)", lines)
        self.assertIn("default-branch n=1 oldest=12.0h ids=14 (on main; never cancelled)", lines)
        self.assertNotIn(("POST", "repos/o/r/actions/runs/14/cancel"), fake.calls)
        self.assertFalse(any("/15" in path or "/16" in path for _, path in fake.calls))

    def test_dry_run_and_list_limit(self):
        out, code, fake = run(stale.main, ["--repo", "o/r", "--dry-run", "--limit", "1", "--status", "queued"],
                              routes(), NOW)
        self.assertIsNone(code)
        self.assertIn("11 CI push PR#5 queued 12.0h", out.splitlines())
        self.assertIn("truncated queued: limit 1 reached (listed 1 of 9)", out)
        self.assertFalse(any(method == "POST" for method, _ in fake.calls))

    def test_call_cap_skips_the_rest(self):
        out, code, _ = run(stale.main, ["--repo", "o/r", "--status", "queued", "--max-calls", "2"], routes(), NOW)
        self.assertIsNone(code)
        self.assertIn("11 CI push PR#5 queued 12.0h -> skipped: api-call cap 2 reached", out)

    def test_api_error(self):
        _, code, _ = run(stale.main, ["--repo", "o/r"], routes(("GET", "=repos/o/r", Fail(404))), NOW)
        self.assertEqual(code, "github-ci-cookbook: o/r: gh: failed (HTTP 404)")

    def test_bad_arguments(self):
        for argv, message in ((["--older-than", "6x"], "--older-than '6x': use a number and m, h, or d (for example 6h)"),
                              (["--older-than", "30m"], "--older-than must be at least 1h"),
                              (["--status", "done"], "--status takes queued,in_progress,waiting,pending,requested")):
            _, code, _ = run(stale.main, ["--repo", "o/r", *argv], [], NOW)
            self.assertEqual(code, f"github-ci-cookbook: {message}")

    def test_default_clock(self):
        out, code, _ = run(stale.main, ["--repo", "o/r", "--dry-run"], routes(), None)
        self.assertIsNone(code)
        self.assertTrue(out.startswith("stale o/r"))


class Parts(unittest.TestCase):
    def test_summary_shortens_long_id_lists(self):
        items = [(i, 3600.0) for i in range(7)]
        self.assertEqual(stale.summary("x", items, "why"), "x n=7 oldest=1.0h ids=0,1,2,3,4,... (why)")


if __name__ == "__main__":
    unittest.main()
