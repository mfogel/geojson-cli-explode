/* eslint-env jest */

const fs = require('fs')
const { explode } = require('../src/index.js')

const GeojsonEquality = require('geojson-equality')
const geojsonEq = new GeojsonEquality()

const fixturesDir = 'test/fixtures'
const featuresDir = 'test/features'

const getStream = path => fs.createReadStream(path, 'utf8')
const getJson = path => JSON.parse(fs.readFileSync(path, 'utf8'))

/* helper to explode but keep disk ops in test directory */
const explodeTest = (stream, opts = {}) => {
  opts['directory'] = opts['directory'] || featuresDir
  return explode(stream, opts)
}

/* helper to compare json content of two on-disk files */
const expectJsonEqual = (pathActual, pathExpected) => {
  const actual = getJson(pathActual)
  const expected = getJson(pathExpected)
  expect(geojsonEq.compare(actual, expected)).toBeTruthy()
}

/* Clear away our features dir
 *
 * Note that aborting the test rather than clobbering what's in the way isn't
 * practical: https://github.com/facebook/jest/issues/2713 */
const clearFeaturesDir = (target = featuresDir) =>
  new Promise((resolve, reject) =>
    fs.readdir(target, (err, files) => {
      if (err) {
        if (err.code === 'ENOENT') return resolve() /* nothing in the way */
        console.error(`Something in the way of ${target}, plz (re)move it!`)
        return reject(err)
      }
      files.forEach(file => fs.unlinkSync(`${target}/${file}`))
      fs.rmdirSync(target)
      return resolve()
    })
  )

beforeEach(clearFeaturesDir)
afterEach(clearFeaturesDir)

test('error on invalid json input', () => {
  const streamIn = getStream(`${fixturesDir}/not-json`)
  expect.assertions(1)
  return explodeTest(streamIn).catch(() =>
    expect(fs.existsSync(featuresDir)).toBeFalsy()
  )
})

test('error on input of bad geojson', () => {
  const streamIn = getStream(`${fixturesDir}/json-but-not-geojson.json`)
  expect.assertions(1)
  return explodeTest(streamIn).catch(() =>
    expect(fs.existsSync(featuresDir)).toBeFalsy()
  )
})

test('error on input of type is not a FeatureCollection', () => {
  const streamIn = getStream(`${fixturesDir}/feature-first.geojson`)
  expect.assertions(1)
  return explodeTest(streamIn).catch(() =>
    expect(fs.existsSync(featuresDir)).toBeFalsy()
  )
})

test('error on input of no type', () => {
  const streamIn = getStream(`${fixturesDir}/no-type.geojson`)
  expect.assertions(1)
  return explodeTest(streamIn).catch(() =>
    expect(fs.existsSync(featuresDir)).toBeFalsy()
  )
})

test('warn on output not proper Features', () => {
  const streamIn = getStream(
    `${fixturesDir}/feature-collection-with-a-bad-feature.geojson`
  )
  const warn = jest.fn()

  expect.assertions(1)
  return explodeTest(streamIn, { warn }).then(() =>
    expect(warn).toHaveBeenCalled()
  )
})

test('error on something in the way of features directory', () => {
  const content = 'really valuable stuff here'
  fs.writeFileSync(featuresDir, content, 'utf8')

  const streamIn = getStream(`${fixturesDir}/feature-collection-empty.geojson`)

  expect.assertions(1)
  return explodeTest(streamIn)
    .catch(() => expect(fs.readFileSync(featuresDir, 'utf8')).toEqual(content))
    .then(() => fs.unlinkSync(featuresDir))
})

test('empty feature collection', () => {
  const streamIn = getStream(`${fixturesDir}/feature-collection-empty.geojson`)

  expect.assertions(2)
  return explodeTest(streamIn)
    .then(() => expect(fs.statSync(featuresDir).isDirectory()).toBeTruthy())
    .then(() => expect(fs.readdirSync(featuresDir)).toEqual([]))
})

test('feature collection with one element', () => {
  const streamIn = getStream(`${fixturesDir}/feature-collection-one.geojson`)

  expect.assertions(2)
  return explodeTest(streamIn)
    .then(() => expect(fs.readdirSync(featuresDir)).toEqual(['1.geojson']))
    .then(() =>
      expectJsonEqual(
        `${featuresDir}/1.geojson`,
        `${fixturesDir}/feature-first.geojson`
      )
    )
})

test('feature collection with two elements', () => {
  const streamIn = getStream(`${fixturesDir}/feature-collection-two.geojson`)

  expect.assertions(3)
  return explodeTest(streamIn).then(() => {
    expect(fs.readdirSync(featuresDir)).toEqual(['1.geojson', '2.geojson'])
    expectJsonEqual(
      `${featuresDir}/1.geojson`,
      `${fixturesDir}/feature-first.geojson`
    )
    expectJsonEqual(
      `${featuresDir}/2.geojson`,
      `${fixturesDir}/feature-second.geojson`
    )
  })
})

test('directory option', () => {
  const otherFeatures = 'other-features'
  clearFeaturesDir(otherFeatures)

  const streamIn = getStream(`${fixturesDir}/feature-collection-empty.geojson`)

  expect.assertions(1)
  return explodeTest(streamIn)
    .then(() => expect(fs.statSync(featuresDir).isDirectory()).toBeTruthy())
    .then(() => clearFeaturesDir(otherFeatures))
})

test('extension option', () => {
  const extension = 'json'
  const streamIn = getStream(`${fixturesDir}/feature-collection-one.geojson`)

  expect.assertions(1)
  return explodeTest(streamIn, { extension }).then(() =>
    expect(fs.readdirSync(featuresDir)).toEqual([`1.${extension}`])
  )
})

test('include bboxes in filenames basic', () => {
  const streamIn = getStream(`${fixturesDir}/feature-collection-two.geojson`)
  const includeBboxes = true

  expect.assertions(1)
  return explodeTest(streamIn, { includeBboxes }).then(() => {
    expect(fs.readdirSync(featuresDir)).toEqual([
      '1.[0,0,0,0].geojson',
      '2.[-1.1,-1.1,2.2,2.2].geojson'
    ])
  })
})

test('include bboxes in filenames close to zero', () => {
  const streamIn = getStream(
    `${fixturesDir}/feature-collection-close-to-zero.geojson`
  )
  const includeBboxes = true

  expect.assertions(1)
  return explodeTest(streamIn, { includeBboxes }).then(() => {
    expect(fs.readdirSync(featuresDir)).toEqual([
      '1.[-0.000001,-0.000001,0.000001,0.000001].geojson'
    ])
  })
})

test('include bboxes in filenames, features with same bbox', () => {
  const streamIn = getStream(
    `${fixturesDir}/feature-collection-same-bbox.geojson`
  )
  const includeBboxes = true

  expect.assertions(1)
  return explodeTest(streamIn, { includeBboxes }).then(() => {
    expect(fs.readdirSync(featuresDir)).toEqual([
      '1.[-1.1,-1.1,2.2,2.2].geojson',
      '2.[-1.1,-1.1,2.2,2.2].geojson'
    ])
  })
})

test('include bboxes in filenames, warn if unable to compute bbox and put empty array in filename', () => {
  const streamIn = getStream(
    `${fixturesDir}/feature-collection-with-a-bad-feature.geojson`
  )
  const warn = jest.fn()
  const includeBboxes = true

  expect.assertions(2)
  return explodeTest(streamIn, { warn, includeBboxes })
    .then(() => expect(warn).toHaveBeenCalled())
    .then(() => expect(fs.readdirSync(featuresDir)).toEqual(['1.[].geojson']))
})
