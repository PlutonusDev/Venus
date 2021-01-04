const inquirer = require("inquirer");
const chalk = require("chalk");
const table = require("cli-table");
const readlines = require("n-readlines");
const { checkToken, insertToken, deleteToken, getAllTokens } = require("../util/database");
const { checkAccount } = require("../util/discord");
const wait = require("util").promisify(setTimeout);
inquirer.registerPrompt("file-tree", require("inquirer-file-tree-selection-prompt"));

const tokenReg = /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/;

module.exports = logger => {
	return {
		addSingle: () => {
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

		addMultiple: () => {
			return new Promise((res, rej) => {
				logger.log(`These should be files in ${chalk.cyan("./src/data/tokens/")} with a token per line.\n`);
				inquirer.prompt([
					{
						name: "file",
						type: "file-tree",
						message: "    Choose a file to add tokens from:",
						extensions: ["txt"],
						root: "./src/data/tokens/"
					}
				]).then(async resp => {
					let liner = new readlines(resp.file);
					let next;
					let tokens = 0;
					let valid = 0;
					while(next = liner.next()) {
						tokens++;
						if(checkToken(next.toString())) continue;
						if(!next.toString().match(tokenReg)) continue;
						valid++;
						insertToken(next.toString());
					}
					console.log();
					logger.ok(`Added ${chalk.cyan(valid)} of ${chalk.cyan(tokens)} tokens from file. ${chalk.red(tokens-valid)} tokens were invalid.`);
					await wait(4000);

					res();
				});
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
					colWidths: [30, 9, 28, 20, 20]
				});
				tokens.forEach(token => {
					promises.push(new Promise(async (res, rej) => {
						let data = await checkAccount(token.entry.replace("\r",""));
						if(!data || (data && data.type=="bot")) {
							output.push([token.entry, data && data.type=="bot" ? chalk.red("Bot Acc") : chalk.red("No"), data ? data.tag : "N/A", data ? data.id : "N/A", data ? data.created : "N/A"]);
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
						message: `Would you like to ${chalk.red("remove all invalid tokens")} from the database?`,
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
