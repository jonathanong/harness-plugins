// Entry point for hooks.json. Node runs this file directly by stripping types, so there is no build.
import { runHook } from '../src/command-policy/index.mts'

process.exitCode = await runHook(process.argv.slice(2), {
  readStdin: async () => {
    const chunks: Buffer[] = []
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
    return Buffer.concat(chunks).toString('utf8')
  },
  stdout: process.stdout,
  stderr: process.stderr,
  env: process.env,
  cwd: process.cwd(),
})
