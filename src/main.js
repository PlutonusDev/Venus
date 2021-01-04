const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const inquirer = require("inquirer");

module.exports = class Venus {
	constructor(logger) {
		this.logger = logger;
		this.handlers = {
			token: require("./handlers/token")(this.logger),
			raid: require("./handlers/raid")(this, this.logger)
		}
	}

	splash() {
		let splash = figlet.textSync("Venus", {
			font: "Basic",
			width: 80,
			whitespaceBreak: true
		}).split("\n");
		splash.forEach((line, i) => splash[i]=`    ${line}`);
		console.log(chalk.cyan(`\n\n${splash.join("\n")}`));
	}

	loop() {
		clear();
		this.splash();
		this.logger.log("Welcome to Venus, by PlutonusDev\n\n");
		inquirer.prompt([
			{
				name: "opt",
				type: "list",
				message: "What would you like to do?",
				prefix: "    ",
				choices: [{
					name: "    Add Single Token",
					value: "single"
				},
				{
					name: "    Add Multiple Tokens from File",
					value: "multiple"
				},
				{
					name: "    Check Tokens",
					value: "check"
				},
				{
					name: "    Start a Raid",
					value: "raid"
				},
				{
					name: "    Exit",
					value: "exit",
					short: "Bye bye :("
				}]
			}
		]).then(async resp => {
			clear();
			this.splash();
			switch(resp.opt) {
				case "single":
					await this.handlers.token.addSingle();
					break;

				case "multiple":
					await this.handlers.token.addMultiple();
					break;

				case "check":
					await this.handlers.token.check();
					break;

				case "raid":
					await this.handlers.raid.loop();
					break;

				case "exit":
					process.exit(0);
					break;
			}
			this.loop();
		});
	}
}
