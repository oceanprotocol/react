module.exports = function override(config, env) {
  const path = require('path')

  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        react: path.resolve('../node_modules/react')
      }
    }
  }
}
