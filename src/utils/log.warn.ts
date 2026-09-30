import chalk from "chalk";
import config from "../config/index.js";

export const logWarn = (msg: any) => {
  if (config.NODE_ENV === "development") {
    console.warn(chalk.yellow(`[${new Date().toISOString()}] WARNING:`), msg);
  }
};
