const { exec } = require('child_process');

module.exports = {
    id: 'npm',
    execute: ({ registry, printer, path }) => {
        const command = `cd ${path} && npm publish ${registry ? `--registry ${registry}` : ''}`;
        exec(command, (error, stdout, stderr) => {
            if (error) printer.warning(error);
            else if (stdout) printer.info(stdout)
            else if (stderr) printer.warning(stderr);
        });
    }
}