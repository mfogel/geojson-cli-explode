# geojson-cli-explode

Explode your GeoJSON FeatureCollections into directories of separate GeoJSON Feature files.

[![npm version](https://img.shields.io/npm/v/geojson-cli-explode.svg)](https://www.npmjs.com/package/geojson-cli-explode)
[![build status](https://img.shields.io/travis/mfogel/geojson-cli-explode.svg)](https://travis-ci.org/mfogel/geojson-cli-explode)
[![test coverage](https://img.shields.io/coveralls/mfogel/geojson-cli-explode/master.svg)](https://coveralls.io/r/mfogel/geojson-cli-explode)

## Quickstart

```sh
$ npm install -g geojson-cli-explode
$ cat my-feature-collection.geojson | geojson-cli-explode
$ ls features/
1.geojson 2.geojson 3.geojson ...
```

## Usage

A GeoJSON file containing a `FeatureCollection` is expected via `stdin`. The `FeatureCollection` will be split into a series of individual files placed within the same directory, each file containing one `Feature`.

## Options

### `-d <directory>` / `--directory <directory>`

Write the `Feature` files to `directory`. Defaults to `features` if not specified.

### `-e <extension>` / `---extension <extension>`

Use `extension` as the filename extension for the `Feature` files. Defaults to `geojson` if not specified.

### `--include-bboxes-in-filenames`

If specified, the filename for each `Feature` file will be of the format:

```
<int: position in original FeatureCollection>.<bounding box of Feature>.<extension (default: 'geojson')>
```

Example filename: `42.[-58.5314588,-34.705637,-58.3351249,-34.5265535].geojson`

### `-s` / `--silent`

Send any warnings (normally written to `stderr`) straight to `/dev/null`.

## Changelog

### 0.1.2

* set up CI: travis, coveralls

### 0.1.1

* fix description in package.json

### 0.1

* Initial release
