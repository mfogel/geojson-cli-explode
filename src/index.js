const fs = require('fs')

const explodeOptsDefaults = {
  warn: console.warn,
  directory: 'features',
  extension: 'geojson',
  includeBBoxes: false
}

const explode = (streamIn, opts = {}) => {
  opts = Object.assign(explodeOptsDefaults, opts)

  return new Promise((resolve, reject) =>
    fs.mkdir(opts.directory, err => (err ? reject(err) : resolve()))
  )
}

module.exports = { explode, explodeOptsDefaults }
