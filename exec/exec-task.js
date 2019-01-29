const {exec, pushd, popd} = require('shelljs');


module.exports = (command, workDir) => {
    return new Promise(function(resolve, reject) {
        if (workDir) {
            pushd('-q', workDir);
        }
		exec(command, function(code, stdout, stderr) {
			console.log('Exit code:', code);
			if (String(code) === '0') {
				resolve({
                    stdout,
                    stderr
                });
			} else {
				reject({
                    stdout,
                    stderr
                });
			}
		});
        if (workDir) {
            popd('-q');
        }
	});
};
