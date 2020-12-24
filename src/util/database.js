const sqlite = require("better-sqlite3");
const db = new sqlite("./src/data/global.sqlite");

const table = db.prepare("SELECT count(*) FROM sqlite_master WHERE TYPE='table' AND NAME='tokens';").get();
if(!table["count(*)"]) {
	db.prepare("CREATE TABLE tokens (entry);").run();
}

module.exports = {
	checkToken: token => db.prepare("SELECT entry FROM tokens WHERE entry=?;").get(token),
	insertToken: token => db.prepare("INSERT INTO tokens (entry) VALUES (@entry);").run({entry:token}),
	deleteToken: token => db.prepare("DELETE FROM tokens WHERE entry=?;").run(token),

	getAllTokens: () => db.prepare("SELECT entry FROM tokens;").all()
}
