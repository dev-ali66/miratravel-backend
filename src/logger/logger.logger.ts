import chalk from "chalk";
import util from "util";
import config from "../config/index.js";

export type LogLevel = "INFO" | "SUCCESS" | "WARN" | "ERROR" | "DEBUG";

const levelColor = {
  INFO: chalk.blueBright.bold,
  SUCCESS: chalk.greenBright.bold,
  WARN: chalk.yellowBright.bold,
  ERROR: chalk.redBright.bold,
  DEBUG: chalk.magentaBright.bold,
};

class Logger {
  private get isDevelopment() {
    return config.NODE_ENV === "development";
  }

  private format(args: any[]) {
    return args.map((arg) => {
      if (arg instanceof Error) {
        return {
          name: arg.name,
          message: arg.message,
          stack: this.isDevelopment ? arg.stack : undefined,
        };
      }

      if (typeof arg === "object" && arg !== null) {
        return util.inspect(arg, {
          depth: null,
          colors: true,
          compact: false,
          breakLength: 120,
          sorted: true,
        });
      }

      return arg;
    });
  }

  private write(level: LogLevel, ...args: any[]) {
    if (level === "DEBUG" && !this.isDevelopment) return;

    const timestamp = new Date().toISOString();

    const prefix = levelColor[level](`[${timestamp}] ${level.padEnd(7)}`);

    console.log(prefix, ...this.format(args));
  }

  info(...args: any[]) {
    this.write("INFO", ...args);
  }

  success(...args: any[]) {
    this.write("SUCCESS", ...args);
  }

  warn(...args: any[]) {
    this.write("WARN", ...args);
  }

  error(...args: any[]) {
    this.write("ERROR", ...args);
  }

  debug(...args: any[]) {
    this.write("DEBUG", ...args);
  }
}

export const logger = new Logger();
