#!/usr/bin/env node
const taskCore = require('./core/task/taskCore');
const logUpdate = require('log-update');
const execa = require('execa');
const Listr = require('listr');
const {Observable} = require('rxjs');



const projectParameters = process.argv.slice(2).filter(param => param.indexOf(':') !== 0 && param.indexOf('^') !== 0);
const taskParameters = process.argv.slice(2).filter(param => param.indexOf(':') === 0 || param.indexOf('^') === 0);

if (projectParameters.length === 0) {
    projectParameters.push('.');
}
// console.log('projectParameters', projectParameters);
// console.log('taskParameters', taskParameters);


logUpdate('Queueing tasks...');

taskCore.queue(projectParameters, taskParameters)
.then(commands => {
    const tasks = commands.map(item => {
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


    const listr = new Listr(tasks, {concurrent: false});
    listr.run().catch(err => {
        console.error('ERROR:', err.message || err);
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
        commandResults[itemID] = result;

        if (result) {
            if (result.exitCode === 0) {
                observer.next('SUCCESS');
                observer.complete();

                return false;
            } else {

                let message = `Exit code: ${result.exitCode}`;
                if (result.stdout) {
                    message += `\nstdout: ${result.stdout}`;
                }
                if (result.stderr) {
                    message += `\nstderr: ${result.stderr}`;
                }
                throw {
                    message,
                    result,
                };
            }
        } else {
            observer.next('UNKNOWN');
            return await updateCommandResult(observer, itemID);
        }
    });
};
