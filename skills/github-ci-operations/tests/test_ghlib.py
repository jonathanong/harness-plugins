import unittest

from fakegh import Fail, FakeGh, ghlib


def items(n):
    return [{"id": i} for i in range(n)]


class Api(unittest.TestCase):
    def test_get_and_post(self):
        fake = FakeGh([("GET", "a", {"x": 1}), ("POST", "b", None)])
        with fake.patch():
            gh = ghlib.Gh(5)
            self.assertEqual(gh.api("a"), {"x": 1})
            self.assertEqual(gh.api("b", "POST"), {})
        self.assertEqual(fake.calls, [("GET", "a"), ("POST", "b")])
        self.assertEqual(gh.calls, 2)

    def test_cap_stops_before_calling(self):
        fake = FakeGh([])
        with fake.patch(), self.assertRaises(ghlib.Exhausted):
            ghlib.Gh(0).api("a")
        self.assertEqual(fake.calls, [])

    def test_error_carries_http_status(self):
        with FakeGh([("GET", "a", Fail(409))]).patch(), self.assertRaises(ghlib.GhError) as raised:
            ghlib.Gh(1).api("a")
        self.assertEqual(raised.exception.status, 409)

    def test_error_without_status_or_message(self):
        with FakeGh([("GET", "a", Fail(None))]).patch(), self.assertRaises(ghlib.GhError) as raised:
            ghlib.Gh(1).api("a")
        self.assertIsNone(raised.exception.status)
        self.assertEqual(str(raised.exception), "gh failed")


class Pages(unittest.TestCase):
    def pages(self, routes, limit, max_calls=10, path="x"):
        with FakeGh(routes).patch():
            return ghlib.Gh(max_calls).pages(path, "items", limit)

    def test_short_list_is_complete(self):
        self.assertEqual(self.pages([("GET", "x", items(3))], 10), (items(3), None, ""))

    def test_follows_pages_and_total(self):
        routes = [("GET", "&page=1", {"items": items(100), "total_count": 105}),
                  ("GET", "&page=2", {"items": items(5), "total_count": 105})]
        got, total, note = self.pages(routes, 500, path="x?a=1")
        self.assertEqual((len(got), total, note), (105, 105, ""))

    def test_limit_inside_a_page(self):
        got, _, note = self.pages([("GET", "x", items(60))], 50)
        self.assertEqual((len(got), note), (50, "limit 50 reached"))

    def test_limit_at_a_page_boundary(self):
        routes = [("GET", "&page=1", {"items": items(100)}), ("GET", "&page=2", {"items": items(100)})]
        got, total, note = self.pages(routes, 150)
        self.assertEqual((len(got), total, note), (150, None, "limit 150 reached"))

    def test_limit_with_exact_total(self):
        got, total, note = self.pages([("GET", "x", {"items": items(100), "total_count": 100})], 100)
        self.assertEqual((len(got), total, note), (100, 100, ""))

    def test_cap_returns_what_was_read(self):
        got, _, note = self.pages([("GET", "x", items(100))], 500, max_calls=1)
        self.assertEqual((len(got), note), (100, "api-call cap 1 reached"))


class Helpers(unittest.TestCase):
    def test_seconds(self):
        self.assertEqual(ghlib.seconds("2026-01-01T00:00:00Z", "2026-01-01T00:01:00Z"), 60)
        self.assertEqual(ghlib.seconds("2026-01-01T00:01:00Z", "2026-01-01T00:00:00Z"), 0)
        self.assertIsNone(ghlib.seconds(None, "2026-01-01T00:00:00Z"))

    def test_percentile(self):
        self.assertEqual(ghlib.percentile([3, 1, 2], 0.5), 2)
        self.assertIsNone(ghlib.percentile([], 0.5))

    def test_fmt_seconds(self):
        self.assertEqual([ghlib.fmt_seconds(v) for v in (None, 30, 600, 7200)], ["-", "30s", "10.0m", "2.0h"])

    def test_queue_pr(self):
        self.assertEqual(ghlib.queue_pr("gh-readonly-queue/main/pr-42-abc"), 42)
        self.assertIsNone(ghlib.queue_pr("feature"))
        self.assertIsNone(ghlib.queue_pr(None))

    def test_fail_exits_with_message(self):
        with self.assertRaises(SystemExit) as raised:
            ghlib.fail("boom")
        self.assertEqual(raised.exception.code, "github-ci-operations: boom")


if __name__ == "__main__":
    unittest.main()
