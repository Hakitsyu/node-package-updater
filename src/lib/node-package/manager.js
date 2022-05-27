const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execute } = require('./executor');

const DEFAULT_PACKAGE_MANAGER_ID = 'npm';

class NodePackageManager {
    #path;
    #managers;
    #printer;

    constructor(printer) {
        this.#path = path.resolve(__dirname, 'managers');
        this.#printer = printer;
    }

    async load() {
        await promisify(fs.readdir)(this.#path, 'utf-8')
            .then(files => {
                this.#managers = files
                    .filter(file => file.endsWith('.js'))
                    .map(file => require(path.resolve(this.#path, file)))
            })
            .catch(err => this.printer.warning(err))
    }

    async execute(id, props = {}) {
        id = id || DEFAULT_PACKAGE_MANAGER_ID;

        const manager = this.#managers.find(manager => manager.id.toLowerCase() === id.toLowerCase())
        return execute(manager, { ...props, printer: this.#printer });
    }
}

module.exports = {
    NodePackageManager,
    DEFAULT_PACKAGE_MANAGER_ID
}