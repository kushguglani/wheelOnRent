const { AgentSchema } = require('./../models/agentForm');
let authenticateAgent = (request, response, next) => {
	var token = request.header('x-auth');
	AgentSchema.findByToken(token).then((agent) => {
		if (!agent) {
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