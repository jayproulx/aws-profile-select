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
    CLI_PROXY_SUFFIX: '-cli-for-profile-select',
    SELF: __filename,
    HOME: process.env.HOME,
    APP_DIR: `${process.env.HOME}/.aws-profile-select`,
    CONFIG: `${process.env.HOME}/.aws-profile-select/config`,
    SESSION_FILE: `${process.env.HOME}/.aws-profile-select/session.${getppid()}`
};

class AWSProfileSelect {
    constructor(options) {
        this.sessionFile = DEFAULTS.SESSION_FILE;

        if (options.install) {
            this.install();
        }

        if (options.uninstall) {
            this.uninstall();
        }

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

    get proxy() {
        // todo: reference this after it's been fetched rather than fetching again

        return `${this.cli}${DEFAULTS.CLI_PROXY_SUFFIX}`;
    }

    install() {
        // exec(`sudo -v`);

        if (!this.cli) {
            console.warn("Please install AWS CLI first");
        }

        console.log(`I would move ${this.cli} to ${this.cli}-cli-for-profile-select and link aws to ${DEFAULTS.SELF}`);
        // exec(`mv ${this.cli} ${this.proxy}`);
        // exec(`ln -s ${this.cli} ${DEFAULTS.SELF}`);
        console.log(`# mv ${this.cli} ${this.proxy}`);
        console.log(`# ln -s ${this.cli} ${DEFAULTS.SELF}`);

        process.exit(0);
    }

    uninstall() {
        if (!this.cli) {
            console.warn("AWS CLI not installed");
            process.exit(1);
        }

        if (!this.proxy) {
            console.warn("AWS CLI not proxied");
            process.exit(1);
        }

        console.log(`I would remove ${this.cli}, and move ${this.proxy} back to ${this.cli}`);
        // exec(`rm ${this.cli}`);
        // exec(`mv ${this.proxy} ${this.cli}`);
        console.log(`# rm ${this.cli}`);
        console.log(`# mv ${this.proxy} ${this.cli}`);

        process.exit(0);
    }

    run() {
        var command = `env AWS_PROFILE=${this.profile} aws cloudformation list-exports`;
        console.log(`running ${command}`);
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

            console.log(`Selected profile ${this.profile}`);

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