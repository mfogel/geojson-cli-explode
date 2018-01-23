/* eslint-env jest */

const fs = require('fs')
const explode = require('../src/index.js')

const GeojsonEquality = require('geojson-equality')
const geojsonEq = new GeojsonEquality()

const getStream = fn => fs.createReadStream(`test/geojson/${fn}`, 'utf8')
const getJson = fn => JSON.parse(fs.readFileSync(`test/geojson/${fn}`, 'utf8'))

test('is this thing on?', () => {})
