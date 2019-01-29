#!/usr/bin/env node

const program = require('commander');


program
    .version('0.1.0', '-v, --version')
    .command('local [action]', 'Run commands for a local project')
    .command('exec <project> <task>', 'Execute tasks on a project')


program.parse(process.argv);
