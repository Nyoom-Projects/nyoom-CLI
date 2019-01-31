module.exports = async (project, taskItem) => {
	if (taskItem.name.indexOf('^') === 0) {
		return {
			...taskItem,
			commands: [{
				type: 'SHELL',
				command: taskItem.name.replace('^', '')
			}],
		};
	}
	const commands = project.tasks[taskItem.name.replace(':', '')];

	if (commands) {
		return {
			...taskItem,
			commands,
		};
	} else {
		throw {
			message: `Task '${taskItem.name}' does not exist in '${project.name}'`,
		};
	}
};
