#! /usr/bin/env node
const program = require("commander");
const chalk = require("chalk");

program
  .command("create <app-name>")
  .description(chalk.cyan("create a new project"))
  .option("-f, --force", "overwrite target directory if it exist")
  .action((name, options) => {
    // console.log(name, options);
    require("../lib/create")(name, options);
  });
// 解析用户命令参数的操作一定要在最后一行，否则什么都不会执行
program.parse(process.argv);
