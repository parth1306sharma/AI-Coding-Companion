import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const TIMEOUT_MS = 10000; // 10s safety limit per compile/run step

/**
 * Runs a command, optionally piping `input` to stdin, and collects
 * stdout/stderr. Kills the process if it exceeds TIMEOUT_MS (guards
 * against infinite loops in submitted code).
 */
function runCommand(command, args, { cwd, input = "" } = {}) {
  return new Promise((resolve) => {
    let child;

    try {
      child = spawn(command, args, { cwd });
    } catch (err) {
      resolve({ stdout: "", stderr: err.message, code: 1 });
      return;
    }

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, TIMEOUT_MS);

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: timedOut ? `${stderr}\n[Execution timed out after 10s]` : stderr,
        code: timedOut ? 1 : code,
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ stdout: "", stderr: err.message, code: 1 });
    });
  });
}

/**
 * Executes user code locally using whatever compilers/runtimes are
 * installed on this machine (g++, javac/java, python, node).
 *
 * Returns a Piston-shaped result so the frontend doesn't need changes:
 * { compile: { stdout, stderr, code }, run: { stdout, stderr, code } }
 */
export const executeCode = async ({ language, code, input = "" }) => {
  const workDir = path.join(os.tmpdir(), `exec-${crypto.randomUUID()}`);
  await fs.mkdir(workDir, { recursive: true });

  let compileResult = { stdout: "", stderr: "", code: 0 };
  let runResult = { stdout: "", stderr: "", code: 0 };

  try {
    switch (language) {
      case "cpp": {
        const srcPath = path.join(workDir, "Main.cpp");
        const exePath = path.join(workDir, "Main.exe");
        await fs.writeFile(srcPath, code);

        compileResult = await runCommand("g++", [srcPath, "-o", exePath]);
        if (compileResult.code !== 0) break;

        runResult = await runCommand(exePath, [], { input });
        break;
      }

      case "c": {
        const srcPath = path.join(workDir, "Main.c");
        const exePath = path.join(workDir, "Main.exe");
        await fs.writeFile(srcPath, code);

        compileResult = await runCommand("gcc", [srcPath, "-o", exePath]);
        if (compileResult.code !== 0) break;

        runResult = await runCommand(exePath, [], { input });
        break;
      }

      case "java": {
        // File must be named Main.java to match `public class Main`
        const srcPath = path.join(workDir, "Main.java");
        await fs.writeFile(srcPath, code);

        compileResult = await runCommand("javac", ["Main.java"], {
          cwd: workDir,
        });
        if (compileResult.code !== 0) break;

        runResult = await runCommand("java", ["-cp", workDir, "Main"], {
          input,
        });
        break;
      }

      case "python": {
        const srcPath = path.join(workDir, "Main.py");
        await fs.writeFile(srcPath, code);

        runResult = await runCommand("python", [srcPath], { input });
        break;
      }

      case "javascript": {
        const srcPath = path.join(workDir, "Main.js");
        await fs.writeFile(srcPath, code);

        runResult = await runCommand("node", [srcPath], { input });
        break;
      }

      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    return {
      language,
      version: "local",
      compile: compileResult,
      run: runResult,
    };
  } finally {
    // Best-effort cleanup, don't block the response on it
    fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
};