const inquirer = require("inquirer");
const chalk = require("chalk");
const table = require("cli-table");
const { checkToken, insertToken, deleteToken, getAllTokens } = require("../util/database");
const { checkAccount } = require("../util/discord");
const wait = require("util").promisify(setTimeout);

const tokenReg = /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/;

module.exports = logger => {
	return {
		single: () => {
			return new Promise((res, rej) => {
				logger.log(`Type ${chalk.cyan("exit")} to return to the menu.\n`);
				inquirer.prompt([
					{
						name: "token",
						type: "input",
						message: "Enter the token you'd like to add:",
						prefix: "    ",
						validate: token => {
							if(checkToken(token)) return "That token is already in the database.";
							if(!token.match(tokenReg) && token!="exit") return "That isn't a token.";
							return true;
						}
					}
				]).then(async resp => {
					if(resp.token=="exit") return res();
					insertToken(resp.token);
					logger.ok("Added the token to the database successfully!");
					await wait(4000);
					res();
				});
			});
		},

		multiple: () => {
			return new Promise((res, rej) => {
				res();
			});
		},

		check: () => {
			return new Promise(async (res, rej) => {
				let tokens = getAllTokens();
				logger.ok(`Found ${chalk.cyan(tokens.length)} tokens in the database!\n`);
				await wait(1000);
				let spinner = logger.load("Checking tokens...");
				let promises = [];
				let invalid = [];
				let output = new table({
					head: ["Token", "Valid", "Name", "ID", "Created"],
					colWidths: [30, 9, 20, 20, 20]
				});
				tokens.forEach(token => {
					promises.push(new Promise(async (res, rej) => {
						let data = await checkAccount(token.entry);
						if(!data) {
							output.push([token.entry, chalk.red("No"), "N/A", "N/A", "N/A"]);
							invalid.push(token.entry);
							/*output.push({
								token: token.entry,
								invalid: true
							});*/
						} else {
							if(data.tag) {
								output.push([token.entry, chalk.green("Yes"), data.tag, data.id, data.created]);
								/*output.push({
									token: token.entry,
									invalid: false,
									...data
								});*/
							}
						}
						res();
					}));
				});
				await Promise.all(promises);
				spinner.succeed("Checked all tokens!");
				await wait(2000);
				console.log();
				output = output.toString().split("\n");
				output.forEach((line, i) => output[i]=`    ${line}`);
				console.log(output.join("\n"));
				console.log();
				if(invalid.length==0) {
					logger.ok(`There were no detected invalid tokens.`);
					await wait(4000);
					return res();
				}
				logger.err(`There were ${chalk.red(invalid.length)} detected invalid tokens!\n`);
				inquirer.prompt([
					{
						name: "remove",
						type: "confirm",
						message: "Would you like to remove all invalid tokens from the database?",
						prefix: "    "
					}
				]).then(async resp => {
					if(!resp.remove) return res();
					let spinner = logger.load("Deleting invalid tokens...");
					let promises = [];
					tokens.forEach(token => {
						promises.push(new Promise((res, rej) => {
							deleteToken(token.entry);
							res();
						}));
					});
					await Promise.all(promises);
					spinner.succeed("Cleaned the database successfully!");
					await wait(4000);
					res();
				});
			});
		}
	}
}
