let env = process.env.NODE_ENV || "DEVELOPMENT";
console.log(env);
if (env === "DEVELOPMENT") {
	let configObject = require('./config.json');
	let envConfig = configObject[env];
	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key];
	})
}
