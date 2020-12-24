const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");
const inquirer = require("inquirer");

module.exports = class Venus {
	constructor(logger) {
		this.logger = logger;
		this.handlers = {
			addToken: require("./handlers/addToken")(this.logger)
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
					value: "multiple",
					disabled: "I haven't added this yet"
				},
				{
					name: "    Check Tokens",
					value: "check"
				},
				{
					name: "    Start a Raid",
					value: "raid",
					disabled: "I haven't added this yet"
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
					await this.handlers.addToken.single();
					break;

				case "multiple":
					await this.handlers.addToken.multiple();
					break;

				case "check":
					await this.handlers.addToken.check();
					break;

				case "raid":
					console.log("raid");
					break;

				case "exit":
					process.exit(0);
					break;
			}
			this.loop();
		});
	}
}
