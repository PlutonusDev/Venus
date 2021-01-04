const clear = require("clear");
const inquirer = require("inquirer");
const chalk = require("chalk");
const { getAllTokens } = require("../util/database");
const { joinGuild, leaveGuild, react, message, dm, voice } = require("../util/discord");
const wait = require("util").promisify(setTimeout)

const inviteRegex = /[A-Za-z/d]{5-8}/

module.exports = (main, logger) => {
	const handlers = {
		//custom: require("./customizer")
	}

	return {
		loop: () => {
			return new Promise((res, rej) => {
				let iloop = () => {
					clear();
					main.splash();
					logger.log(`Ready to raid. ${chalk.red("Do your thing")}.`);
					inquirer.prompt([
						{
							name: "opt",
							type: "list",
							message: "What would you like to do?",
							prefix: "    ",
							choices: [{
								name: "    Customize Bots",
								value: "custom"
							}, {
								name: "    Join a Server",
								value: "join"
							}, {
								name: "    React to a Message",
								value: "react"
							}, {
								name: "    Leave a Server",
								value: "leave"
							}, {
								name: "    Send Messages",
								value: "message"
							}, {
								name: "    DM a Member",
								value: "dm",
							}, {
								name: "    Join a Voice Channel",
								value: "voice"
							}, {
								name: "    Start a Custom Raidbot",
								value: "bot"
							}, {
								name: "    Exit",
								value: "exit"
							}]
						}
					]).then(async resp => {
						switch(resp.opt) {
							case "custom":
								await handlers.custom.loop();
								break;

							case "join":
								await (() => {
									return new Promise((res, rej) => {
										inquirer.prompt([
											{
												name: "invite",
												type: "input",
												message: "Enter a Discord Invite:",
												prefix: "    ",
												validate: v => {
													//if(!v.match(inviteRegex)) return `Enter a full Discord invite link. ${chalk.cyan("discord.gg/abc123")} or ${chalk.cyan("https://www.discordapp.com/invite/abc123")}.`
													return true;
												}
											}
										]).then(async resp => {
											let spinner = logger.load(`Joining ${chalk.cyan(getAllTokens().length)} bots to ${chalk.cyan(resp.invite)}.`);
											let promises = [];
											getAllTokens().forEach(token => {
												promises.push(new Promise((res, rej) => joinGuild(token.entry.replace("\r", ""), resp.invite).then(()=>res())));
											});
											await Promise.all(promises);
											spinner.succeed("Finished joining bots!");
											await wait(4000);
											res();
										});
									});
								})();
								break;

							case "react":
								
								break;

							case "leave":
								
								break;

							case "message":
								
								break;

							case "dm":
								
								break;

							case "voice":
								
								break;

							case "bot":
								
								break;

							case "exit":
								iloop = () => {}
								res();
								break;
						}
						iloop();
					});
				}
				iloop();
			});
		}
	}
}
