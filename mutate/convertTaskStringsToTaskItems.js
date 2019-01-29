module.exports = (tasks) => {
	return tasks.map(task => {
	    name = task;
	    node = 'local';
	    if (task.indexOf('@') !== -1) {
	        name = task.split('@')[0];
	        node = task.split('@')[1];
	    }

	    return {
	        name,
	        node,
	    };
	});
};
