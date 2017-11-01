#!/usr/bin/env node

/**
 * todo:
 * - try to write a trap func EXIT to clean up the session file when the bash session ends
 */

const {AWSProfileSelect} = require('./AWSProfileSelect'),
    {AWSProfileSelectInstaller} = require('./AWSProfileSelectInstaller'),
    yargs = require('yargs')
        .usage('Ensure that the correct profile is selected for all AWS CLI commands.\nUsage: $0')
        .alias('H', 'help')
        .describe('help', 'Print usage and quit.')
        .alias('p', 'profile')
        .describe('profile', 'Selected profile, or omit to select during execution.'),
    argv = yargs.argv;

exports.proxy = __filename;
exports.AWSProfileSelect = AWSProfileSelect;
exports.AWSProfileSelectInstaller = AWSProfileSelectInstaller;