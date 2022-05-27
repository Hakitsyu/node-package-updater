const fs = require('fs');
const { promisify } = require('util');

const NODE_PACKAGE_NAME = 'package.json';

class NodePackageHandler {
    #path;
    #sourcePath;
    #object;
    #sourceObject;
    #printer;

    constructor(path, sourcePath, printer) {
        if (!path.endsWith(NODE_PACKAGE_NAME)) throw new Error(`The path need be the ${NODE_PACKAGE_NAME} path`);
        this.#path = path;
        this.#printer = printer;
        this.#sourcePath = sourcePath;
    }

    #convertObject(object) {
        return JSON.stringify(object, null, '\t');
    }

    async init() {
        return Promise.all([this.#load(), this.#loadSource()])
            .then(([object, sourceObject]) => {
                this.#object = JSON.parse(object);
                if (sourceObject)
                    this.#sourceObject = JSON.parse(sourceObject);
            });
    }

    async #load() {
        return promisify(fs.readFile)(this.#path, 'utf-8');
    }

    async #loadSource() {
        if (!this.#sourcePath) return;
        return promisify(fs.readFile)(this.#sourcePath, 'utf-8');
    }
    
    async update(append) {
        return promisify(fs.writeFile)(this.#path, this.#convertObject({...this.#object, ...append}))
            .then(() => this.#object = {...this.#object, ...append})
            .catch(err => this.#printer.warning(err));
    }

    async updateSource(append) {
        if (!this.#sourcePath) return;
        return promisify(fs.writeFile)(this.#sourcePath, this.#convertObject({...this.#sourceObject, ...append}))
            .then(() => this.#sourceObject = {...this.#sourceObject, ...append})
            .catch(err => this.#printer.warning(err));
    }

    async updateAll(append) {
        await this.update(append);
        await this.updateSource(append);
    }

    async upgradeVersion() {
        this.#printer.info(`Upgrading the version from ${this.version}`)
        const upgrade = (index, version) => {
            if (index === (version.length - 1))
                version[index]++;
            
            if (version[index] >= 10) {
                version[index] = 0;
                version[index - 1]++;
            }

            return index > 0
                ? upgrade(index - 1, version)
                : version.join('.')
        }

        const version = this.version.split('.')
            .map(value => parseInt(value));
        const newVersion = upgrade(version.length - 1, version);
        
        await this.updateAll({version: newVersion})
        this.#printer.success(`Updated to ${newVersion}`);
    }

    get version() {
        return this.#object.version;
    }

    get object() {
        return this.#object;
    }
}

module.exports = {
    NODE_PACKAGE_NAME,
    NodePackageHandler
}

