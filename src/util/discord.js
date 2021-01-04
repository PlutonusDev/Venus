
const discord = require("discord.js");
const moment = require("moment");
const axios = require("axios");

module.exports = {
	checkAccount: token => {
		return new Promise(async (res, rej) => {
			login(token).then(client => {
				res({
					tag: client.user.tag,
					id: client.user.id,
					created: moment(client.user.createdTimestamp).fromNow(),
					type: client.user.bot ? "bot" : "user"
				});
			}).catch(e => {console.log(e);res(false)})
		});
	},

	joinGuild: async (token, invite) => {
		await axios.get(`https://discord.com/api/v8/invites/${invite}?inputValue=${invite}&with_counts=true`, {
			headers: {
				authorization: token,
				referer: "https://discord.com/channels/@me"
			}
		}).then(d => console.log(d.body)).catch(e=>console.log(e.message));
		axios.post(`https://discord.com/api/v8/invites/${invite}`, {
			headers: {
				authorization: token,
				["super-agent"]: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4200.88 Safari/537/36",
				referer: "https://discord.com/channels/@me"
			}
		}).then(() => res()).catch(e=>console.log(e.message));
		/*return new Promise(async (res, rej) => {
			login(token).then(client => {
				client.user.acceptInvite(invite).then(() => res()).catch(() => res());
			}).catch(()=>{});
		});*/
	}
}

const login = token => {
	return new Promise((res, rej) => {
		const client = new discord.Client();
		client.once("ready", () => {
			res(client);
		});
		client.login(token).catch(e => rej(e.message));
	});
}
