import { execFile } from "child_process";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * ============================================================================
 * AI ENHANCER CONFIGURATION (Real-ESRGAN NCNN Vulkan)
 * ============================================================================
 * Cross-platform AI Super-Resolution running locally on CPU/Vulkan GPU.
 * Zero VPS permanent disk storage - output is streamed directly to Cloudflare edge cache.
 */
export const AI_ENHANCER_CONFIG = {
  // Enabled toggle
  ENABLED: true,

  // Standard AI upscaling factor: 4x
  SCALE: 4,

  // Neural network model for natural travel photos, landscapes, and architecture
  MODEL: "realesrgan-x4plus",

  // Tile size for CPU cache optimization (256x256 tiles fit inside CPU L2/L3 cache, 2-3x faster)
  TILE_SIZE: 256,

  // Thread allocation: 2 threads (load:proc:save) to leverage 2 CPU cores in parallel for 2x faster inference
  THREADS: "2:2:2",

  // CPU Limit percentage on 2-core machine (180 = 90% of total 200% capacity, leaving 10% strictly reserved)
  CPU_LIMIT_PERCENT: 180,

  // Nice niceness level for Linux process scheduler (19 = lowest background priority)
  NICE_PRIORITY: 19,

  // Timeout for AI inference (milliseconds)
  TIMEOUT_MS: 30000,
};

/**
 * Resolves the platform-specific Real-ESRGAN binary path.
 * Supports Windows (.exe), Linux (Ubuntu/Debian), and macOS.
 */
export function getRealEsrganBinaryPath(): string | null {
  const isWin = process.platform === "win32";
  const binaryName = isWin ? "realesrgan-ncnn-vulkan.exe" : "realesrgan-ncnn-vulkan";
  const binaryPath = path.resolve(process.cwd(), "bin", "realesrgan", binaryName);

  if (fs.existsSync(binaryPath)) {
    return binaryPath;
  }
  return null;
}

/**
 * Enhances and upscales an image using Real-ESRGAN AI Super-Resolution (Standard 4x).
 * - Operates entirely in RAM / ephemeral temp files.
 * - Leaves 0 bytes of permanent storage on the VPS.
 * - Returns the super-resolved image buffer.
 */
export async function enhanceImageWithAi(input: string | Buffer): Promise<Buffer> {
  const binaryPath = getRealEsrganBinaryPath();
  if (!binaryPath) {
    throw new Error(`Real-ESRGAN binary not found for platform: ${process.platform}`);
  }

  const modelsDir = path.resolve(process.cwd(), "bin", "realesrgan", "models");
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const tempDir = os.tmpdir();
  const tempInputPath = path.join(tempDir, `ai_in_${uniqueId}.png`);
  const tempOutputPath = path.join(tempDir, `ai_out_${uniqueId}.png`);

  let inputNeedsCleanup = false;

  try {
    // 1. Prepare temporary input file
    if (typeof input === "string") {
      await fs.promises.copyFile(input, tempInputPath);
      inputNeedsCleanup = true;
    } else {
      await fs.promises.writeFile(tempInputPath, input);
      inputNeedsCleanup = true;
    }

    // 2. Execute Real-ESRGAN NCNN Vulkan with 2-core parallelism, tile caching & 90% CPU limit
    const args = [
      "-i", tempInputPath,
      "-o", tempOutputPath,
      "-s", String(AI_ENHANCER_CONFIG.SCALE),
      "-t", String(AI_ENHANCER_CONFIG.TILE_SIZE),
      "-j", AI_ENHANCER_CONFIG.THREADS,
      "-m", modelsDir,
      "-n", AI_ENHANCER_CONFIG.MODEL,
    ];

    const isLinux = process.platform === "linux";
    const hasCpulimit = isLinux && (fs.existsSync("/usr/bin/cpulimit") || fs.existsSync("/bin/cpulimit"));

    let execCmd: string;
    let execArgs: string[];

    if (hasCpulimit) {
      // Hard cap at 90% of 2 cores (180%) + lowest background priority (nice -n 19)
      execCmd = "cpulimit";
      execArgs = [
        "-l",
        String(AI_ENHANCER_CONFIG.CPU_LIMIT_PERCENT),
        "--",
        "nice",
        "-n",
        String(AI_ENHANCER_CONFIG.NICE_PRIORITY),
        binaryPath,
        ...args,
      ];
    } else if (isLinux) {
      execCmd = "nice";
      execArgs = ["-n", String(AI_ENHANCER_CONFIG.NICE_PRIORITY), binaryPath, ...args];
    } else {
      execCmd = binaryPath;
      execArgs = args;
    }

    await execFileAsync(execCmd, execArgs, {
      timeout: AI_ENHANCER_CONFIG.TIMEOUT_MS,
      windowsHide: true,
    });

    if (!fs.existsSync(tempOutputPath)) {
      throw new Error("Real-ESRGAN failed to produce output image");
    }

    // 3. Read output into memory buffer
    const enhancedBuffer = await fs.promises.readFile(tempOutputPath);
    return enhancedBuffer;
  } finally {
    // 4. Zero Permanent Storage: cleanup all temporary files immediately
    if (inputNeedsCleanup && fs.existsSync(tempInputPath)) {
      try {
        await fs.promises.unlink(tempInputPath);
      } catch {
        // ignore cleanup error
      }
    }
    if (fs.existsSync(tempOutputPath)) {
      try {
        await fs.promises.unlink(tempOutputPath);
      } catch {
        // ignore cleanup error
      }
    }
  }
}
