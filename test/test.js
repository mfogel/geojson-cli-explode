/* eslint-env jest */

const fs = require('fs')
const { explode } = require('../src/index.js')

const GeojsonEquality = require('geojson-equality')
const geojsonEq = new GeojsonEquality()

const geojsonDir = 'test/geojson'
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

/* Delete anything in the way of our temporary directory
 *
 * Note that aborting the test rather than clobbering what's in the way isn't
 * practical: https://github.com/facebook/jest/issues/2713 */
const clearFeatures = () =>
  new Promise((resolve, reject) =>
    fs.rmdir(featuresDir, () => fs.unlink(featuresDir, () => resolve()))
  )

beforeEach(clearFeatures)
afterEach(clearFeatures)

test('error on invalid json input', () => {
  const streamIn = getStream(`${geojsonDir}/not-json`)
  return expect(explodeTest(streamIn)).rejects.toThrow()
})

test('error on input of bad geojson', () => {
  const streamIn = getStream(`${geojsonDir}/json-but-not-geojson.json`)
  return expect(explodeTest(streamIn)).rejects.toThrow()
})

test('error on input of not a FeatureCollection', () => {
  const streamIn = getStream(`${geojsonDir}/feature-first.geojson`)
  return expect(explodeTest(streamIn)).rejects.toThrow()
})

test('warn on output not proper Features', () => {
  const streamIn = getStream(
    `${geojsonDir}/feature-collection-with-a-bad-feature.geojson`
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

  const streamIn = getStream(`${geojsonDir}/feature-collection-empty.geojson`)

  expect.assertions(1)
  return explodeTest(streamIn).catch(() =>
    expect(fs.readFileSync(featuresDir, 'utf8')).toEqual(content)
  )
})

test('empty feature collection', () => {
  const streamIn = getStream(`${geojsonDir}/feature-collection-empty.geojson`)

  expect.assertions(2)
  return explodeTest(streamIn).then(() => {
    expect(fs.statSync(featuresDir).isDirectory()).toBeTruthy()
    expect(fs.readdirSync(featuresDir)).toEqual([])
  })
})

test('feature collection with one element', () => {
  const streamIn = getStream(`${geojsonDir}/feature-collection-one.geojson`)

  expect.assertions(2)
  return explodeTest(streamIn).then(() => {
    expect(fs.readdirSync(featuresDir).toEqual(['1.geojson']))
    expectJsonEqual(
      `${featuresDir}/1.geojson`,
      `${geojsonDir}/feature-first.geojson`
    )
  })
})

test('feature collection with two elements', () => {
  const streamIn = getStream(`${geojsonDir}/feature-collection-two.geojson`)

  expect.assertions(3)
  return explodeTest(streamIn).then(() => {
    expect(fs.readdirSync(featuresDir).toEqual(['1.geojson', '2.geojson']))
    expectJsonEqual(
      `${featuresDir}/1.geojson`,
      `${geojsonDir}/feature-first.geojson`
    )
    expectJsonEqual(
      `${featuresDir}/2.geojson`,
      `${geojsonDir}/feature-second.geojson`
    )
  })
})

test('directory option', () => {})

test('extension option', () => {})

test('include bboxes in filenames basic', () => {})

test('include bboxes in filenames, features with same bbox', () => {})

test('error if including bboxes with output not proper Features', () => {})
