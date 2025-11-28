import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { tmpdir } from "os"
import { randomUUID } from "crypto"
import { spawn } from "child_process"

export const runtime = "nodejs"

type LanguageKey = "javascript" | "python"

type CommandBuilder = (ctx: { sourcePath: string; workDir: string }) => {
  command: string
  args: string[]
}

interface LanguageConfig {
  sourceFile: string
  build?: CommandBuilder
  run: CommandBuilder
}

const LANGUAGE_CONFIG: Record<LanguageKey, LanguageConfig> = {
  javascript: {
    sourceFile: "main.js",
    run: ({ sourcePath }) => ({
      command: "node",
      args: [sourcePath],
    }),
  },
  python: {
    sourceFile: "main.py",
    run: ({ sourcePath }) => ({
      command: "python3",
      args: [sourcePath],
    }),
  },
}

const INPUT_LIMIT = 100_000 // 100 KB
const CODE_LIMIT = 200_000 // 200 KB
const EXECUTION_TIMEOUT_MS = 7000

const runProcess = ({
  command,
  args,
  cwd,
  stdin,
}: {
  command: string
  args: string[]
  cwd: string
  stdin?: string
}) =>
  new Promise<{
    stdout: string
    stderr: string
    code: number | null
    signal: NodeJS.Signals | null
    timedOut: boolean
  }>((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""
    let finished = false
    const timeout = setTimeout(() => {
      if (!finished) {
        child.kill("SIGKILL")
        finished = true
        resolve({
          stdout,
          stderr: `${stderr}\nRuntimeError: Execution timed out`.trim(),
          code: 124,
          signal: "SIGKILL",
          timedOut: true,
        })
      }
    }, EXECUTION_TIMEOUT_MS)

    child.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    child.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    child.on("close", (code, signal) => {
      if (finished) return
      finished = true
      clearTimeout(timeout)
      resolve({
        stdout,
        stderr,
        code,
        signal,
        timedOut: false,
      })
    })

    if (stdin) {
      child.stdin.write(stdin)
    }
    child.stdin.end()
  })

export async function POST(request: Request) {
  try {
    const { language, code, input = "" } = await request.json()

    if (!language || !code) {
      return NextResponse.json(
        { error: "language and code are required" },
        { status: 400 }
      )
    }

    if (code.length > CODE_LIMIT) {
      return NextResponse.json(
        { error: "Code size limit exceeded (200KB)" },
        { status: 400 }
      )
    }

    if (input.length > INPUT_LIMIT) {
      return NextResponse.json(
        { error: "Input size limit exceeded (100KB)" },
        { status: 400 }
      )
    }

    const langKey = language.toLowerCase() as LanguageKey
    const config = LANGUAGE_CONFIG[langKey]

    if (!config) {
      return NextResponse.json(
        { error: `Language '${language}' is not supported yet.` },
        { status: 400 }
      )
    }

    const workDir = path.join(tmpdir(), `code-run-${randomUUID()}`)
    await fs.mkdir(workDir, { recursive: true })

    const sourcePath = path.join(workDir, config.sourceFile)
    await fs.writeFile(sourcePath, code, "utf-8")

    let runResult
    try {
      if (config.build) {
        runResult = await runProcess({
          ...config.build({ sourcePath, workDir }),
          cwd: workDir,
          stdin: input,
        })
      } else {
        runResult = await runProcess({
          ...config.run({ sourcePath, workDir }),
          cwd: workDir,
          stdin: input,
        })
      }
    } finally {
      await fs.rm(workDir, { recursive: true, force: true })
    }

    const stdoutClean = runResult.stdout.trimEnd()
    const stderrClean = runResult.stderr.trim()

    return NextResponse.json({
      run: {
        stdout: stdoutClean,
        stderr: stderrClean,
        output: [stdoutClean, stderrClean].filter(Boolean).join("\n"),
        code: runResult.code,
        signal: runResult.signal,
        exited: !runResult.timedOut,
      },
    })
  } catch (error) {
    console.error("[code-execute] error:", error)
    return NextResponse.json(
      {
        error: "Failed to execute code",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}