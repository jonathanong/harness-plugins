"""A fake `gh api` for the script tests: routes requests by method and path, records each call."""
import contextlib, io, json, os, subprocess, sys
from unittest import mock

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts"))
import ghlib  # noqa: E402


class Fail:
    """A failed `gh` call. `status` None prints no HTTP status and no message."""

    def __init__(self, status):
        self.stderr = f"gh: failed (HTTP {status})" if status else ""


class Seq:
    """Answers in turn; the last answer repeats."""

    def __init__(self, *answers):
        self.answers = list(answers)

    def next(self):
        return self.answers.pop(0) if len(self.answers) > 1 else self.answers[0]


class FakeGh:
    """Routes are (method, key, answer). The first route whose key occurs in the path answers;
    a key starting with "=" must equal the path. Unrouted requests fail with HTTP 404."""

    def __init__(self, routes):
        self.routes = routes
        self.calls = []

    def __call__(self, args, capture_output, text):
        method, path = (args[3] if args[2] == "-X" else "GET"), args[-1]
        self.calls.append((method, path))
        for route_method, key, answer in self.routes:
            matched = path == key[1:] if key.startswith("=") else key in path
            if route_method == method and matched:
                answer = answer.next() if isinstance(answer, Seq) else answer
                if isinstance(answer, Fail):
                    return subprocess.CompletedProcess(args, 1, "", answer.stderr)
                return subprocess.CompletedProcess(args, 0, "" if answer is None else json.dumps(answer), "")
        return subprocess.CompletedProcess(args, 1, "", "gh: no route (HTTP 404)")

    def patch(self):
        return mock.patch.object(ghlib.subprocess, "run", self)


def run(main, argv, routes, now):
    """Runs a script's main with the fake; returns (stdout, exit message or None, fake)."""
    fake, out = FakeGh(routes), io.StringIO()
    with fake.patch(), contextlib.redirect_stdout(out):
        try:
            main(argv, now)
            code = None
        except SystemExit as exit_:
            code = exit_.code
    return out.getvalue(), code, fake
