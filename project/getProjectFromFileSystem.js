const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');


module.exports = async (directory = '.') => {
	const filePath = path.join(directory, 'nyoom.yml');

	if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
		try {
			const project = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
			project.projectPath = directory;

			return project;
		} catch (err) {
			console.log(err);

			throw err;
		}
	} else {
		throw {
			message: `${filePath} does not exist on local filesystem`,
		};
	}
};
