import chalk from "chalk";
import config from "../config/index.js";

export const logConsole = (val: any) => {
  if (config.NODE_ENV === "development") {
    console.log(chalk.green(`[${new Date().toISOString()}] CONSOLE:`), val);
  }
};
