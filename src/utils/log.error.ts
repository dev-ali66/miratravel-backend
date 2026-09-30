import chalk from "chalk";
import config from "../config/index.js";

export const logError = (err: any) => {
  if (config.NODE_ENV === "development") {
    console.error(chalk.red(`[${new Date().toISOString()}] ERROR:`), err);
  }
};
