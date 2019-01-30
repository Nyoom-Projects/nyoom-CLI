#!/usr/bin/env node
const convertTaskStringsToTaskItems = require('./mutate/convertTaskStringsToTaskItems');
const exec = require('./exec/exec-task');
const {populateTaskCommands} = require('./task');
const {getProjectFromFileSystem} = require('./project');
const Queue = require('better-queue');


let queue = new Queue((command, cb) => {
    (async() => {
        switch (command.type) {
            case 'SHELL':
                console.info(`\n\nExecuting \`${command.command}\` in '${command.workDir}':`);
                await exec(command.command, command.workDir);
                break;

            default:
                throw {
                    message: `Unsupported command type '${command.type}'`,
                };
        }
    })().then(() => {
        cb(null, '');
    })
    .catch(err => {
        cb(err);
    });
});


const projectParameters = process.argv.slice(2).filter(param => param.indexOf(':') !== 0 && param.indexOf('^') !== 0);
const taskParameters = process.argv.slice(2).filter(param => param.indexOf(':') === 0 || param.indexOf('^') === 0);

if (projectParameters.length === 0) {
    projectParameters.push('.');
}
console.log('projectParameters', projectParameters);
console.log('taskParameters', taskParameters);

const taskItemsWithoutCommands = convertTaskStringsToTaskItems(taskParameters);

if (taskItemsWithoutCommands.length === 0) {
    console.error('Specify at least one task or command');
} else {
    (async() => {
        const projects = await Promise.all(projectParameters.map(projectPath => getProjectFromFileSystem(projectPath)));

        for (let project of projects) {
            const taskItems = await Promise.all(taskItemsWithoutCommands.map(task => populateTaskCommands(project, task)));
            const commandsList = taskItems.map(taskItem => taskItem.commands.map(command => ({
                ...command,
                workDir: project.projectPath,
                task: taskItem,
            })));

            const commands = flatten(commandsList);

            executeCommand(commands[0], commands.slice(1));
        }
    })().catch(err => {
        console.error('ERROR:', err.message || err);
    });
}

const executeCommand = (command, remainingCommands) => {
    if (!command) {
        return;
    }
    // console.info('Comand:', command);
    // console.info('Remaining commands:', remainingCommands);

    queue.push(command)
    .on('finish', function (_result) {
        executeCommand(remainingCommands[0], remainingCommands.slice(1));
    })
    .on('failed', function (err) {
        console.error('Command Error:', err.message || err);
    });
}

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);
