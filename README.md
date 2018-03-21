# geojson-cli-explode

Explode your GeoJSON FeatureCollections into directories of separate GeoJSON Feature files.

[![npm version](https://img.shields.io/npm/v/geojson-cli-explode.svg)](https://www.npmjs.com/package/geojson-cli-explode)
[![build status](https://img.shields.io/travis/mfogel/geojson-cli-explode/master.svg)](https://travis-ci.org/mfogel/geojson-cli-explode)
[![test coverage](https://img.shields.io/coveralls/mfogel/geojson-cli-explode/master.svg)](https://coveralls.io/r/mfogel/geojson-cli-explode)

## Quickstart

```sh
$ npm install -g geojson-cli-explode
$ cat my-feature-collection.geojson | geojson-cli-explode
$ ls features/
1.geojson 2.geojson 3.geojson ...
```

## Usage

A GeoJSON file containing a `FeatureCollection` is expected via `stdin`. The `FeatureCollection` will be split into a series of individual files placed within the same directory, each file containing one `Feature`. By default, the files will be named `1.geojson`, `2.geojson`, etc.

## Options

### `-d <directory>` / `--directory <directory>`

Write the `Feature` files to `directory`. Defaults to `features` if not specified.

### `-e <extension>` / `---extension <extension>`

Use `extension` as the filename extension for the `Feature` files. Defaults to `geojson` if not specified.

### `--include-bboxes-in-filenames`

If specified, the filename for each `Feature` file will including its bounding box. The bounding box will be rounded outward to six decimal places, and the filenames will be formatted like so:

```
<int: position in original FeatureCollection>.<bounding box of Feature>.<extension (default: 'geojson')>
```

For example: `42.[-58.531458,-34.70563,-58.335124,-34.526553].geojson`

### `-s` / `--silent`

Send any warnings (normally written to `stderr`) straight to `/dev/null`.

## Changelog

### 0.2

* Limit bboxes in filenames to six decimal places of percision

### 0.1.2

* set up CI: travis, coveralls

### 0.1.1

* fix description in package.json

### 0.1

* Initial release
