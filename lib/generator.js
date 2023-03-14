const { getRepoList, getTagList } = require("./http");
const ora = require("ora");
const inquirer = require("inquirer");
const util = require("util");
const downloadGitRepo = require("download-git-repo");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用ora初始化，传入展示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法
    const result = await fn(...args);
    // 状态为修改成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态修改为失败
    spinner.fail("Request failed, refetch...");
  }
}

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对download-git-repo 进行promise改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  // 1. 从远程拉去模板数据
  // 2. 用户选择自己新下载的模板名称
  // 3. return 用户选择的名称

  async getRepo() {
    // 从远程拉去模板数据
    const repoList = await wrapLoading(getRepoList, "waiting fetch template");

    if (!repoList) {
      return;
    }

    // 过滤我们需要的模板名称
    const repos = repoList.map((item) => item.name);

    // 用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: "Please choose a template to create project",
    });

    // return 用户选择的名称
    return repo;
  }

  // 基于用户选择的版本
  // 1. 基于repo的结果，远程拉去对应的tag列表
  // 2. 自动选择最新的tag
  async getTag(repo) {
    // 基于repo的结果，远程拉去对应的tag列表
    const tags = await wrapLoading(getTagList, "waiting fetch tag", repo);
    if (!tags) {
      return;
    }
    // 过滤我们需要的tag 名称
    const tagList = tags.map((item) => item.name);

    // 自动选择最新的tag
    return tagList[0];
  }

  // 下载远程模板
  // 1. 拼接下载地址
  // 2. 调用下载方法
  async download(repo, tag) {
    const requestUrl = `lvybTest/${repo}${tag ? "#" + tag : ""}`;

    await wrapLoading(
      this.downloadGitRepo,
      "waiting download template",
      requestUrl, // 参数1： 下载地址
      path.resolve(process.cwd(), this.targetDir) // 参数2： 创建位置
    );
  }

  // 核心创建逻辑
  // 1.获取模板名称
  // 2.获取tag名称
  // 3.下载模板到模板目录
  // 4.对uniapp模板中部分文件进行读写
  // 5.模板使用提示
  async create() {
    try {
      // 获取模板名称
      const repo = await this.getRepo();

      // 获取tag名称
      const tag = await this.getTag(repo);

      // 下载模板到模板目录
      await this.download(repo, tag);

      // 模板使用提示;
      console.log(`\r\n Successful created project ${chalk.cyan(this.name)}`);
      console.log(`\r\n cd ${chalk.cyan(this.name)}`);
      console.log(`\r\n 启动前请务必阅读 ${chalk.cyan("readme.md")}文件`);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = Generator;