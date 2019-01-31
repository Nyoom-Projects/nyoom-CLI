const unirestPromiseHandler = require('../../unirestPromiseHandler');
const taskAPI = require('../../api/taskAPI');


module.exports.queue = (projectParameters, taskParameters) => {
	return taskAPI.queue(projectParameters, taskParameters)
	   .catch(unirestPromiseHandler.handleError);
};

module.exports.getCommandResult = (commandID) => {
	return taskAPI.getCommand(commandID)
        .then((command) => command.result)
        .catch(unirestPromiseHandler.handleError);
};
