const unirest = require('unirest');
const unirestPromise = require('./unirest-promise');
const config = require('../config');


const queue = (projectParameters, taskParameters) => {
	return unirestPromise(
		unirest.post(`${config.API_HOST}/tasks`)
        .type('json')
        .send({
            projectParameters,
            taskParameters,
        })
	)
	.then((data) => data.body)
};


const getCommand = (commandID) => {
	return unirestPromise(
		unirest.get(`${config.API_HOST}/command/${commandID}`)
        .type('json')
	)
	.then((data) => data.body)
};


module.exports.queue = queue;
module.exports.getCommand = getCommand;
