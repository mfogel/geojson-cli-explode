#!/usr/bin/env node

const { stdin, exit } = require('process')
const { explode, explodeOptsDefaults } = require('./index.js')

const onError = err => {
  console.error(`Error: ${err.message}`)
  exit(1)
}

const getWarn = silent => (silent ? () => {} : explodeOptsDefaults.warn)

require('yargs')
  .command(
    '$0',
    'Explode a FeatureCollection given on stdin into separate Feature files',
    yargs =>
      yargs.example(
        'cat feature-col.geojson | $0  # -> features/<int>.geojson'
      ),
    yargs => {
      const opts = {
        directory: yargs.directory,
        extension: yargs.extension,
        includeBBoxes: yargs.includeBboxesInFilenames,
        warn: getWarn(yargs.silent)
      }
      explode(stdin, opts).catch(onError)
    }
  )
  .option('d', {
    alias: 'directory',
    describe: 'Directory to write Feature files to',
    default: explodeOptsDefaults.directory
  })
  .option('e', {
    alias: 'extension',
    describe: 'File extension to use for Feature files',
    default: explodeOptsDefaults.extension
  })
  .option('include-bboxes-in-filenames', {
    describe: 'Include bounding boxes in Feature filenames',
    boolean: true
  })
  .option('s', {
    alias: 'silent',
    describe: 'Do not write warnings to stderr',
    boolean: true
  })
  .alias('h', 'help')
  .alias('v', 'version')
  .strict()
  .parse()
