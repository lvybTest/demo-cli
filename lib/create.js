const path = require("path");
// fs-extra 是对fs模块的扩展，支持promise的语法
const fs = require("fs-extra");
// 用户交互式询问用户问题
const inquirer = require("inquirer");
const Generator = require("./generator");

// 1. 抛出一个方法用来接受用户要创建的文件夹（项目名）和其他参数
module.exports = async function (name, options) {
  // 当前命令行选择的目录
  const cwd = process.cwd();
  // 需要创建的目录地址
  const targetAir = path.join(cwd, name);

  console.log(targetAir, cwd, name);

  // 2. 判断是否存在相同的文件夹（项目）名
  // 目录是否已存在
  if (fs.existsSync(targetAir)) {
    // 是否为强制创建
    if (options.force) {
      await fs.remove(targetAir);
    } else {
      // 询问用户是否确定要覆盖
      let { action } = await inquirer.prompt([
        {
          name: "action",
          type: "list",
          message: "Target directory already Pick an action",
          choices: [
            {
              name: "Overwrite",
              value: "overwrite",
            },
            {
              name: "Cancel",
              value: false,
            },
          ],
        },
      ]);

      if (!action) {
        return;
      } else if (action === "overwrite") {
        // 移除已存在的目录
        console.log("\r\nRemoving...");
        await fs.remove(targetAir);
      }
    }
  }

  // 3. 创建generator类
  const generator = new Generator(name, targetAir);
  generator.create();
};
