import contextlib, io, os, sys, tempfile, unittest
from fractions import Fraction

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

    def test_ci_low_target(self):
        # 3 of 3 has Wilson lower bound 44%, so 50% lower-bound bar is unreachable at n=3.
        self.assertEqual(eval_stats.verdict(3, 3, 3, 80, ci_low_target=50), "missed")
        # 4 of 4 has Wilson lower bound 51%, meeting both 80% and lower-CI 50%.
        self.assertEqual(eval_stats.verdict(4, 4, 4, 80, ci_low_target=50), "met")
        # 4 of 4 with 5 planned still needs the 5th to confirm lower bound >= 50%.
        self.assertEqual(eval_stats.verdict(4, 4, 5, 80, ci_low_target=50), "undecided")
        # 9 of 9 with 10 planned already clears lower bound >= 50% even if the 10th fails.
        self.assertEqual(eval_stats.verdict(9, 9, 10, 80, ci_low_target=50), "met")


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


class Workflow(unittest.TestCase):
    def test_noisy_or_score_is_exact(self):
        # 70% CR and 50% QA as equal hard gates -> 85% combined catch rate.
        self.assertEqual(eval_stats.workflow_score([(7, 10, 1), (5, 10, 1)]), Fraction(17, 20))
        # Advisory planning (e=0.5) alone at 3/3 caps at 50%.
        self.assertEqual(
            eval_stats.workflow_score([(3, 3, "0.5"), (0, 3, 1), (0, 3, 1)]), Fraction(1, 2)
        )

    def test_weighted_score_is_exact(self):
        stages = [(2, 3, 1), (3, 3, 3), (1, 3, 2)]
        self.assertEqual(eval_stats.workflow_score(stages, combine="weighted"), Fraction(13, 18))

    def test_workflow_interval_both_modes_reproducible(self):
        noisy = [(2, 3, "0.5"), (2, 3, 1), (1, 3, 1)]
        first = eval_stats.workflow_interval(noisy, combine="noisy-or", seed=0, draws=400)
        self.assertEqual(first, eval_stats.workflow_interval(noisy, combine="noisy-or", seed=0, draws=400))
        mean, low, high = first
        self.assertAlmostEqual(mean, 100 * 23 / 27)
        self.assertLess(low, mean)
        self.assertLess(mean, high)

        weighted = [(2, 3, 1), (3, 3, 3), (2, 3, 2)]
        w_mean, w_low, w_high = eval_stats.workflow_interval(weighted, combine="weighted", seed=0, draws=400)
        self.assertAlmostEqual(w_mean, 100 * 5 / 6)
        self.assertLess(w_low, w_mean)
        self.assertLess(w_mean, w_high)

    def test_workflow_verdict_floors_and_combined_target(self):
        # All stages ran: CR met, plan met, QA missed floor -> missed when floors enforced, met without.
        stages = [(2, 3, 3, 1, 60), (3, 3, 3, 3, 70), (1, 3, 3, 2, 50)]
        self.assertEqual(
            eval_stats.workflow_verdict(stages, 70, combine="weighted", enforce_floors=True), "missed"
        )
        self.assertEqual(
            eval_stats.workflow_verdict(stages, 70, combine="weighted", enforce_floors=False), "met"
        )
        # Weak CR drags weighted score to 67% even though plan and QA are 3/3.
        weak_cr = [(3, 3, 3, 1, 60), (1, 3, 3, 3, 30), (3, 3, 3, 2, 50)]
        self.assertEqual(
            eval_stats.workflow_verdict(weak_cr, 70, combine="weighted", enforce_floors=True), "missed"
        )

    def test_workflow_verdict_early_stopping_and_skipping(self):
        # CR missed its floor before QA even ran -> missed immediately (skip QA).
        skipped = [(2, 3, 3, "0.5", 60), (1, 2, 3, 1, 70), (0, 0, 3, 1, 50)]
        self.assertEqual(eval_stats.workflow_verdict(skipped, 80, enforce_floors=True), "missed")
        # Remaining attempts cannot lift score to 80% even without floors -> missed.
        unreachable = [(0, 3, 3, "0.5", 0), (0, 3, 3, 1, 0), (0, 0, 3, "0.5", 0)]
        self.assertEqual(eval_stats.workflow_verdict(unreachable, 80, enforce_floors=False), "missed")
        # Guaranteed met before QA finishes when floors are off (CR 3/3 -> 100% under Noisy-OR).
        already_met = [(2, 3, 3, "0.5", 60), (3, 3, 3, 1, 70), (0, 0, 3, 1, 50)]
        self.assertEqual(eval_stats.workflow_verdict(already_met, 80, enforce_floors=False), "met")
        # Still undecided when QA floor hasn't run yet and floors are enforced.
        self.assertEqual(eval_stats.workflow_verdict(already_met, 80, enforce_floors=True), "undecided")
        # Met early with floors enforced when every stage met its floor and min_score >= target.
        early_floors_met = [(2, 2, 3, 1, 60), (2, 2, 3, 1, 60)]
        self.assertEqual(
            eval_stats.workflow_verdict(early_floors_met, 60, combine="weighted", enforce_floors=True),
            "met",
        )
        # Still undecided when a CI lower-bound target is set and a stage hasn't finished.
        self.assertEqual(
            eval_stats.workflow_verdict(already_met, 80, enforce_floors=False, ci_low_target=50),
            "undecided",
        )

    def test_workflow_verdict_ci_low_target(self):
        # CR 3/3 + QA 2/3 clears 70% lower bound; CR 3/3 + QA 0/3 only reaches ~53%.
        strong = [(3, 3, 3, 1, 70), (2, 3, 3, 1, 50)]
        weak_qa = [(3, 3, 3, 1, 70), (0, 3, 3, 1, 0)]
        self.assertEqual(
            eval_stats.workflow_verdict(strong, 80, ci_low_target=70, draws=400), "met"
        )
        self.assertEqual(
            eval_stats.workflow_verdict(weak_qa, 80, ci_low_target=70, draws=400), "missed"
        )


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
        lines = run("case,passed,attempts,planned,target,ci_low_target\na,7,10,10,70,40\nb,0,0,,,\n", "--planned", "3")
        self.assertEqual(lines[0], "a: 70 [40-89], 7 of 10, missed")
        self.assertEqual(lines[1], "b: not run")
        self.assertRegex(lines[2], r"^suite: 70 \[\d+-\d+\], 0 of 2 cases met their target$")
        self.assertEqual(lines[3], "undecided: b")

    def test_gap_between_arms(self):
        header = "case,passed,attempts,baseline_passed,baseline_attempts\n"
        lines = run(header + "".join(f"c{i},3,3,0,3\n" for i in range(8)) + "d,3,3,,\n")
        self.assertRegex(lines[-1], r"^gap: \+100 \[\+\d+ to \+\d+\] over 8 cases$")
        lines = run(header + "a,2,3,2,3\n")
        self.assertRegex(lines[-1], r"^gap: \+0 \[-\d+ to \+\d+\] over 1 cases, does not show a difference$")

    def test_no_case_ran(self):
        self.assertEqual(run("case,passed,attempts\na,0,0\n"), ["a: not run", "undecided: a"])

    def test_workflow_csv_noisy_or_full_and_partial(self):
        csv_text = (
            "case,stage,effectiveness,stage_priority,stage_target,case_priority,case_target,case_ci_low_target,passed,attempts\n"
            "reg-1,planning,0.5,medium,,critical,80,50,2,3\n"
            "reg-1,code-review,1,high,90,critical,80,50,3,3\n"
            "reg-1,qa,1,low,,critical,80,50,2,3\n"
            "reg-2,planning,0.5,medium,,high,,,2,3\n"
            "reg-2,code-review,1,high,,high,,,2,2\n"
            "reg-2,qa,1,low,,high,,,0,0\n"
        )
        lines = run(csv_text)
        self.assertRegex(lines[0], r"^reg-1: 100 \[\d+-100\], met$")
        self.assertEqual(lines[1], "  planning (e=0.5): 67 [21-94], 2 of 3, met")
        self.assertEqual(lines[2], "  code-review (e=1): 100 [44-100], 3 of 3, met")
        self.assertEqual(lines[3], "  qa (e=1): 67 [21-94], 2 of 3, met")
        self.assertEqual(lines[4], "reg-2: undecided")
        self.assertEqual(lines[5], "  planning (e=0.5): 67 [21-94], 2 of 3, met")
        self.assertEqual(lines[6], "  code-review (e=1): 2 of 2, undecided")
        self.assertEqual(lines[7], "  qa (e=1): not run")
        self.assertEqual(lines[8], "workflow: 1 of 2 cases met their target")
        self.assertEqual(lines[9], "undecided: reg-2")

    def test_workflow_csv_weighted_no_stage_floors(self):
        csv_text = (
            "case,stage,weight,stage_priority,case_priority,passed,attempts\n"
            "reg-1,planning,1,medium,high,2,3\n"
            "reg-1,code-review,3,high,high,3,3\n"
            "reg-1,qa,2,low,high,1,3\n"
        )
        lines = run(csv_text, "--combine", "weighted", "--no-stage-floors")
        self.assertRegex(lines[0], r"^reg-1: 72 \[\d+-\d+\], met$")
        self.assertEqual(lines[1], "  planning (w=1): 67 [21-94], 2 of 3, met")
        self.assertEqual(lines[4], "workflow: 1 of 1 cases met their target")
        self.assertEqual(len(lines), 5)


if __name__ == "__main__":
    unittest.main()
