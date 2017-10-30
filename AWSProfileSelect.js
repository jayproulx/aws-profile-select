const fs = require('fs'),
    exec = require('child_process').execSync,
    nconf = require('nconf'),
    select = require('select-shell')({
        pointer: ' ▸ ',
        multiSelect: false,
        prepend: true,
        msgCancel: 'No option selected, using [default].',
        msgCancelColor: 'red'
    });

const DEFAULTS = {
    PROFILE: 'default',
    CLI_PROXY_SUFFIX: '-cli-for-profile-select',
    SELF: __filename,
    HOME: process.env.HOME
};

class AWSProfileSelect {
    constructor(options) {
        this.selectedProfile = DEFAULTS.PROFILE;

        nconf.argv().env();

        nconf.file({
            file: `${DEFAULTS.HOME}/.aws/aws-profile-select.json`
        });

        if (options.install) {
            this.install();
        }

        if (options.uninstall) {
            this.uninstall();
        }

        if (!fs.existsSync(`${DEFAULTS.HOME}/.aws/.aws_profile_select`)) {
            this.selectProfile();
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
        var command = `env AWS_PROFILE=${this.selectedProfile} aws cloudformation list-exports`;
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
            this.selectedProfile = options[0].value;
            console.log(`Selected profile ${this.selectedProfile}`);
            this.run();
        }.bind(this));

        select.on('cancel', function () {
            this.run();
        }.bind(this));

        select.list();
    }
}

exports.AWSProfileSelect = AWSProfileSelect;