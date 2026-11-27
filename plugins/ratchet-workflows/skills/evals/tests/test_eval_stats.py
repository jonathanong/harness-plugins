import contextlib, io, os, sys, tempfile, unittest

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts"))
import eval_stats  # noqa: E402


def run(text, *flags):
    with tempfile.TemporaryDirectory() as directory:
        path = os.path.join(directory, "results.csv")
        with open(path, "w") as handle:
            handle.write(text)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            eval_stats.main([path, "--draws", "400", *flags])
    return out.getvalue().splitlines()


class Needed(unittest.TestCase):
    def test_table_at_three_attempts(self):
        self.assertEqual([eval_stats.needed(t, 3) for t in (80, 70, 60, 50)], [3, 3, 2, 2])

    def test_whole_numbers_at_ten_attempts(self):
        self.assertEqual([eval_stats.needed(t, 10) for t in (80, 70, 60, 50)], [8, 7, 6, 5])


class Wilson(unittest.TestCase):
    def test_reference_table(self):
        table = {
            (0, 2): (0, 66),
            (1, 2): (9, 91),
            (2, 2): (34, 100),
            (0, 3): (0, 56),
            (1, 3): (6, 79),
            (2, 3): (21, 94),
            (3, 3): (44, 100),
        }
        for (passed, attempts), expected in table.items():
            low, high = eval_stats.wilson(passed, attempts)
            self.assertEqual((round(low), round(high)), expected, (passed, attempts))


class Verdict(unittest.TestCase):
    def test_two_attempts_of_three(self):
        cases = {
            (2, 80): "undecided",  # critical needs 3 of 3
            (1, 80): "missed",
            (2, 60): "met",
            (1, 50): "undecided",
            (0, 70): "missed",
        }
        for (passed, target), expected in cases.items():
            self.assertEqual(eval_stats.verdict(passed, 2, 3, target), expected, (passed, target))

    def test_critical_misses_at_first_failure(self):
        self.assertEqual(eval_stats.verdict(0, 1, 3, 80), "missed")

    def test_required_needs_every_attempt(self):
        target = eval_stats.TARGETS["required"]
        self.assertEqual(eval_stats.verdict(1, 1, 1, target), "met")
        self.assertEqual(eval_stats.verdict(2, 3, 10, target), "missed")
        self.assertEqual(eval_stats.verdict(9, 9, 10, target), "undecided")

    def test_all_attempts_run(self):
        self.assertEqual(eval_stats.verdict(2, 3, 3, 70), "missed")
        self.assertEqual(eval_stats.verdict(3, 3, 3, 70), "met")


class Intervals(unittest.TestCase):
    def test_all_pass_suite_is_not_zero_width(self):
        mean, low, high = eval_stats.suite_interval([(3, 3)] * 10, draws=400)
        self.assertEqual(mean, 100)
        self.assertLess(low, high)
        self.assertLess(high, 100)

    def test_one_case_suite(self):
        mean, low, high = eval_stats.suite_interval([(0, 3)], draws=400)
        self.assertEqual(mean, 0)
        self.assertLess(0, high)
        self.assertLess(low, high)

    def test_same_seed_same_interval(self):
        cases = [(3, 3), (1, 3), (2, 3)]
        self.assertEqual(
            eval_stats.suite_interval(cases, seed=7, draws=400),
            eval_stats.suite_interval(cases, seed=7, draws=400),
        )

    def test_gap_clear_of_zero(self):
        gap, low, high = eval_stats.gap_interval([((3, 3), (0, 3))] * 10, draws=400)
        self.assertEqual(gap, 100)
        self.assertGreater(low, 0)
        self.assertGreater(high, low)

    def test_gap_that_includes_zero(self):
        gap, low, high = eval_stats.gap_interval([((2, 3), (2, 3))] * 3, draws=400)
        self.assertEqual(gap, 0)
        self.assertLess(low, 0)
        self.assertGreater(high, 0)


class Describe(unittest.TestCase):
    def test_full_run_has_an_interval(self):
        self.assertEqual(eval_stats.describe(2, 3, 3, 60), "67 [21-94], 2 of 3, met")

    def test_early_stop_has_no_interval(self):
        self.assertEqual(eval_stats.describe(2, 2, 3, 60), "2 of 2, met, stopped early")
        self.assertEqual(eval_stats.describe(0, 1, 3, 80), "0 of 1, missed, stopped early")

    def test_undecided_is_not_a_stop(self):
        self.assertEqual(eval_stats.describe(1, 2, 3, 50), "1 of 2, undecided")


class Cli(unittest.TestCase):
    def test_reference_example(self):
        lines = run(
            "case,priority,passed,attempts\n"
            "no-secret-in-logs,critical,2,2\n"
            "refund-needs-approval,critical,1,2\n"
            "retry-uses-backoff,medium,2,2\n"
            "summary-is-short,low,1,2\n"
            "migration-is-reversible,high,0,2\n"
        )
        self.assertEqual(
            lines[:5],
            [
                "no-secret-in-logs: 2 of 2, undecided",
                "refund-needs-approval: 1 of 2, missed, stopped early",
                "retry-uses-backoff: 2 of 2, met, stopped early",
                "summary-is-short: 1 of 2, undecided",
                "migration-is-reversible: 0 of 2, missed, stopped early",
            ],
        )
        self.assertRegex(lines[5], r"^suite: 60 \[\d+-\d+\], 1 of 5 cases met their target$")
        self.assertEqual(lines[6], "undecided: no-secret-in-logs summary-is-short")
        self.assertEqual(len(lines), 7)

    def test_default_priority_planned_column_and_unrun_case(self):
        lines = run("case,passed,attempts,planned\na,7,10,10\nb,0,0,\n", "--planned", "3")
        self.assertEqual(lines[0], "a: 70 [40-89], 7 of 10, met")
        self.assertEqual(lines[1], "b: not run")
        self.assertRegex(lines[2], r"^suite: 70 \[\d+-\d+\], 1 of 2 cases met their target$")
        self.assertEqual(lines[3], "undecided: b")

    def test_gap_between_arms(self):
        header = "case,passed,attempts,baseline_passed,baseline_attempts\n"
        lines = run(header + "".join(f"c{i},3,3,0,3\n" for i in range(8)) + "d,3,3,,\n")
        self.assertRegex(lines[-1], r"^gap: \+100 \[\+\d+ to \+\d+\] over 8 cases$")
        lines = run(header + "a,2,3,2,3\n")
        self.assertRegex(lines[-1], r"^gap: \+0 \[-\d+ to \+\d+\] over 1 cases, does not show a difference$")

    def test_no_case_ran(self):
        self.assertEqual(run("case,passed,attempts\na,0,0\n"), ["a: not run", "undecided: a"])


if __name__ == "__main__":
    unittest.main()
