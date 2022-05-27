const { NodePackageHandler } = require("../lib/node-package/handler");
const { NodePackageManager } = require("../lib/node-package/manager");
const path = require('path');

const command = {
  name: 'node-package-updater',
  run: async (toolbox) => {
    const { 
      print,
      parameters: { options },
      filesystem
    } = toolbox

    const relativePath = filesystem.path(options.path);
    const relativeSourcePath = options.sourcePath ? filesystem.path(options.sourcePath) : null;

    const nodePackageHandler = new NodePackageHandler(relativePath, relativeSourcePath, print);
    await nodePackageHandler.init();
    await nodePackageHandler.upgradeVersion();

    const packageManagers = new NodePackageManager(print);
    await packageManagers.load();
    await packageManagers.execute(options.manager, { 
      path: path.dirname(relativePath),  
      sourcePath: relativeSourcePath ? path.dirname(relativeSourcePath) : null,
      registry: options.registry
    });
  }
}

module.exports = command
