const fs = require('fs')
const geojsonhint = require('@mapbox/geojsonhint')
const JSONStream = require('JSONStream')

const explodeOptsDefaults = {
  warn: console.warn,
  directory: 'features',
  extension: 'geojson',
  includeBBoxes: false
}

const explode = (streamIn, opts = {}) => {
  opts = Object.assign(explodeOptsDefaults, opts)

  const handleMkdirError = (err, reject) => {
    if (err.code === 'EEXIST') {
      err = new Error(
        `Cannot make target directory for features '${opts.directory}', something is in the way`
      )
    }
    reject(err)
  }

  let seenType = false
  const checkType = obj => {
    if (obj['type'] === 'FeatureCollection') seenType = true
  }

  const filesWritten = []
  let fileCnt = 0
  const handleFeature = feature => {
    fileCnt += 1
    const path = `${opts.directory}/${fileCnt}.${opts.extension}`

    const errors = geojsonhint.hint(feature)
    errors.forEach(e =>
      opts.warn(
        `Warning: Invalid GeoJSON passed-through to ${path}: ${e.message}`
      )
    )

    fs.writeFileSync(path, JSON.stringify(feature))
    filesWritten.push(path)
  }

  const handleJSONParseError = (err, reject) => {
    if (!seenType) {
      filesWritten.forEach(fs.unlinkSync)
      fs.rmdirSync(opts.directory)
    }
    return reject(err)
  }

  const handleClose = (resolve, reject) => {
    if (!seenType) {
      filesWritten.forEach(fs.unlinkSync)
      fs.rmdirSync(opts.directory)
      return reject(new Error('Input is not a well-formed FeatureCollection'))
    }
    resolve()
  }

  return new Promise((resolve, reject) => {
    try {
      fs.mkdirSync(opts.directory)
    } catch (err) {
      return handleMkdirError(err, reject)
    }

    const featureStream = JSONStream.parse('features.*')
    featureStream.on('header', checkType)
    featureStream.on('footer', checkType)
    featureStream.on('data', handleFeature)
    featureStream.on('error', err => handleJSONParseError(err, reject))
    featureStream.on('close', () => handleClose(resolve, reject))
    streamIn.pipe(featureStream)
  })
}

module.exports = { explode, explodeOptsDefaults }
