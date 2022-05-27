const { build } = require('gluegun')

/**
 * Create the cli and kick it off
 */
async function run(argv) {
  // create a CLI runtime
  const cli = build()
    .brand('node-package-updater')
    .src(__dirname)
    .plugins('./node_modules', {
      matching: 'node-package-updater-*',
      hidden: true,
    })
    .create()

  const toolbox = await cli.run(argv)
  return toolbox
}

module.exports = { run }
