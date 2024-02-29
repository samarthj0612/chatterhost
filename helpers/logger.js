const colorReset = "\x1b[0m"; // Reset text color

const red = (text) => `\x1b[31m${text}${colorReset}`;
const green = (text) => `\x1b[32m${text}${colorReset}`;
const yellow = (text) => `\x1b[33m${text}${colorReset}`;
const blue = (text) => `\x1b[34m${text}${colorReset}`;
const magenta = (text) => `\x1b[35m${text}${colorReset}`;
const cyan = (text) => `\x1b[36m${text}${colorReset}`;

const logger = {
	log: straightLogger,
	info: infoLogger,
	warn: warnLogger,
	success: successLogger,
	error: errorLogger,
	debug: debugLogger,
	api: apiLogger,
};

function straightLogger(...args) {
	console.log(new Date().toISOString(), "- log:", ...args);
}

function infoLogger(...args) {
	console.info(new Date().toISOString(), "-", cyan("info"), ":", ...args);
}

function successLogger(...args) {
	console.log(new Date().toISOString(), "-", green("success"), ":", ...args);
}

function errorLogger(...args) {
	console.error(new Date().toISOString(), "-", red("error"), ":", ...args);
}

function warnLogger(...args) {
	console.warn(new Date().toISOString(), "-", yellow("warn"), ":", ...args);
}

function debugLogger(...args) {
	console.debug(new Date().toISOString(), "-", blue("debug"), ":", ...args);
}

function apiLogger(...args) {
	console.debug(new Date().toISOString(), "-", magenta(" API "), ":", ...args);
}

module.exports = { logger };
