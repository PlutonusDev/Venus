const discord = require("discord.js");
const moment = require("moment");

module.exports = {
	checkAccount: token => {
		return new Promise((res, rej) => {
			const client = new discord.Client();
			client.once("ready", () => {
				res({
					tag: client.user.tag,
					id: client.user.id,
					created: moment(client.user.createdTimestamp).calendar(),
					type: client.user.bot ? "bot" : "user"
				});
			});
			client.login(token).catch(e => {
				res(false);
			});
		});
	}
}
