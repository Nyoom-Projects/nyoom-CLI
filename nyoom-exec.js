#!/usr/bin/env node
const taskCore = require('./core/task/taskCore');
const logUpdate = require('log-update');
const Listr = require('listr');
const {Observable} = require('rxjs');



const projectParameters = process.argv.slice(2).filter(param => param.indexOf(':') !== 0 && param.indexOf('^') !== 0);
const taskParameters = process.argv.slice(2).filter(param => param.indexOf(':') === 0 || param.indexOf('^') === 0);


if (projectParameters.length === 0) {
    console.error('At least one Project is required');
    process.exit(1);
} else if (taskParameters.length === 0) {
    console.error('At least one Task is required');
    process.exit(1);
}

logUpdate('Queueing tasks...');

taskCore.queue(projectParameters, taskParameters)
.then(commandGroups => {
    const taskGroup = commandGroups.map(group => {
        const tasks = group.commands.map(item => {
            return {
                title: `${item.id}\t ${item.type}\t ${item.command}`,
                task: () => {
                    return new Observable(observer => {
                        observer.next('QUEUED');
                        updateCommandResult(observer, item.id)
                        .then(() => {})
                        .catch((err) => {
                            observer.error(err);
                        });
                    });
                }
            };
        });

        return {
            title: `${group.project.name}`,
            task: () => {
                return new Listr(tasks, {
                    concurrent: false,
                    collapse: false,
                });
            }
        };
    });


    const listr = new Listr(taskGroup, {
        concurrent: true,
        collapse: false,
        exitOnError: false,
    });
    listr.run().catch(err => {
        // console.error('ERROR:', err.message || err);
    });
});


const scheduleUpdateCommandResult = (observer, itemID) => setTimeout(() => {
    updateCommandResult(observer, itemID).then((shouldContinue) => {
        if (shouldContinue) {
            scheduleUpdateCommandResult(itemID);
        }
    });
}, 500);

const updateCommandResult = (observer, itemID) => {
    return taskCore.getCommandResult(itemID)
    .then(async result => {
        if (result) {
            if (result.exitCode === 0) {
                observer.next('SUCCESS');
                observer.complete();

                return false;
            } else {
                let message = '';
                if (result.message !== undefined) {
                    message += `${result.message}`;
                }
                if (result.exitCode !== undefined) {
                    message += `\nExit code: ${result.exitCode}`;
                }
                if (result.stdout) {
                    message += `\nstdout: ${result.stdout}`;
                }
                if (result.stderr) {
                    message += `\nstderr: ${result.stderr}`;
                }
                throw {
                    message: message.trim(),
                    result,
                };
            }
        } else {
            observer.next('UNKNOWN');
            return await updateCommandResult(observer, itemID);
        }
    });
};
