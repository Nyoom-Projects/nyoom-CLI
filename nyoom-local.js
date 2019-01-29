#!/usr/bin/env node

const commander = require('commander');


commander
    .version('0.1.0', '-v, --version')
    .command('exec', 'Execute a task')
    .parse(process.argv);
