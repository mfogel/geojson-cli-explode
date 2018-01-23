#!/usr/bin/env node

const { stdin, exit } = require('process')
const explode = require('./index.js')

const onError = err => {
  console.error(`Error: ${err.message}`)
  exit(1)
}

const getWarn = silent => (silent ? () => {} : console.warn)

require('yargs')
  .command(
    '$0',
    'Explode a FeatureCollection given on stdin into separate Feature files',
    yargs =>
      yargs.example(
        'cat feature-col.geojson | $0  # -> features/<int>.geojson'
      ),
    yargs => {
      try {
        explode(stdin, {
          directory: yargs.directory,
          extension: yargs.extension,
          includeBBoxes: yargs.includeBBoxesInFilenames,
          warn: getWarn(yargs.silent)
        })
      } catch (err) {
        onError(err)
      }
    }
  )
  .option('d', {
    alias: 'directory',
    describe: 'Directory to write Feature files to',
    default: 'features'
  })
  .option('e', {
    alias: 'extension',
    describe: 'File extension to use for Feature files',
    default: 'geojson'
  })
  .option('include-bboxes-in-filenames', {
    describe: 'Include bounding boxes in Feature filenames',
    boolean: 'true'
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
