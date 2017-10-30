const exec = require('child_process').execSync;

const DEFAULTS = {
    CLI_PROXY_SUFFIX: '-cli-for-profile-select',
    SELF: __filename,
    HOME: process.env.HOME
};

class AWSProfileSelectInstaller {
    constructor(options) {
        if (options.install) {
            this.install();
        }

        if (options.uninstall) {
            this.uninstall();
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
}

exports.AWSProfileSelectInstaller = AWSProfileSelectInstaller;