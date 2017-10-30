const fs = require('fs'),
    exec = require('child_process').execSync,
    select = require('select-shell')({
        pointer: ' ▸ ',
        multiSelect: false,
        prepend: true,
        msgCancel: 'No option selected, using [default].',
        msgCancelColor: 'red'
    });

function getppid() {
    return (require('child_process').execSync(`ps -p ${process.pid} -o ppid=`) + '').split('\n')[0]
}

const DEFAULTS = {
    PROFILE: 'default',
    HOME: process.env.HOME,
    APP_DIR: `${process.env.HOME}/.aws-profile-select`,
    CONFIG: `${process.env.HOME}/.aws-profile-select/config`,
    SESSION_FILE: `${process.env.HOME}/.aws-profile-select/session.${getppid()}`
};

class AWSProfileSelect {
    constructor(options) {
        this.sessionFile = DEFAULTS.SESSION_FILE;

        if (options.profile) {
            this.profile = options.profile;
        } else if(fs.existsSync(this.sessionFile)) {
            this.profile = fs.readFileSync(this.sessionFile);
        }

        if (!this.profile && !fs.existsSync(`${DEFAULTS.HOME}/.aws/.aws_profile_select`)) {
            this.selectProfile();
        } else {
            this.run();
        }
    }

    get cli() {
        // todo: reference this after it's been fetched rather than fetching again
        var cli = exec(`which aws`);

        // we'll get some extra whitespace here, remove it, also need to switch CLI to a string first.
        cli = (cli + '').trim();

        return cli;
    }

    run() {
        var args = process.argv.splice(2, process.argv.length-1);
        var command = `env AWS_PROFILE=${this.profile} ${this.cli} ${args.join(' ')}`;
        console.log(`${command}`);
        exec(command, {stdio: [0, 1, 2]});

        process.exit(0);
    }

    selectProfile() {
        var credentials = fs.readFileSync(`${DEFAULTS.HOME}/.aws/credentials`, 'utf-8');

        var profilesRegex = /\[\w+]/g;

        credentials.match(profilesRegex).forEach(element => {
            select.option(element.replace(/[\[\]]/g, ""))
        });

        select.on('select', function (options) {
            this.profile = options[0].value;

            if(!fs.existsSync(DEFAULTS.APP_DIR)) {
                fs.mkdirSync(DEFAULTS.APP_DIR, 0o700);
            }

            fs.writeFileSync(this.sessionFile, this.profile, {mode: 0o700});

            this.run();
        }.bind(this));

        select.on('cancel', function () {
            this.run();
        }.bind(this));

        select.list();
    }

    /**
     * Returns the parent pid for the current process (not super slick, but most reliable way I could find)
     *
     * Also see https://github.com/nodejs/node/issues/14957
     * @returns Integer parent pid
     */
    static getSessionID() {
        return getppid();
    }
}

exports.AWSProfileSelect = AWSProfileSelect;