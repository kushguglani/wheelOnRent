const { AgentSchema } = require('./../models/agentForm');
let authenticateAgent = (request, response, next) => {
	console.log("auth start");
	var token = request.header('x-auth');
	AgentSchema.findByToken(token).then((agent) => {
		console.log(agent)
		if (!agent) {
			console.log("no token")
			return Promise.reject();
		}
		console.log(agent);
		request.agent = agent;
		request.token = token;
		next();
	}).catch((e) => {
		response.status(401).send();
	})
}
module.exports = { authenticateAgent };