const chalk = require("chalk");
const ora = require("ora");

// Logging
const logger = {
	log: msg => console.log(`    [~] ${msg}`),
	ok: msg => console.log(`    ${chalk.green("[+]")} ${msg}`),
	err: msg => console.log(`    ${chalk.red("[!]")} ${msg}`),

	load: msg => {
		return ora({
			text: msg,
			spinner: "aesthetic",
			color: "cyan",
			indent: 4
		}).start()
	}
}


// Initialize
new (require("./main"))(logger).loop();
