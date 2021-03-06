#!/usr/bin/env node

const {proxy, AWSProfileSelectInstaller} = require('./aws'),
    yargs = require('yargs')
        .usage('Ensure that the correct profile is selected for all AWS CLI commands.\nUsage: $0')
        .alias('H', 'help')
        .describe('help', 'Print usage and quit.')
        .describe('install', 'Create a symlink for this tool that replaces the current AWS CLI, will ask for permissions elevation')
        .boolean('install')
        .describe('uninstall', 'Remove the symlink, and replace the original AWS CLI, will ask for permissions elevation')
        .boolean('uninstall'),
    argv = yargs.argv;

new AWSProfileSelectInstaller(argv);