# copy-and-watch

Synchronize files and folders locally by glob patterns, watch option included.

## Install

```sh
npm i -D @davidhs/copy-and-watch
```

## Usage

```sh
copy-and-watch [options] <sources> <target>

options:
  --watch - enable file watcher
  --clean - clean target folder on start
```

Please note that you need **quote your globs**. Without quote marks the glob will be expanded by the shell instead of `copy-and-watch` which can create unexpected behavior.

### In your `package.json`

You may have some build script in your package.json involving mirroring folders (let's say, static assets), that's a good use-case for `copy-and-watch`:

```json
{
  "devDependencies": {
    "copy-and-watch": "latest"
  },
  "scripts": {
    "build": "copy-and-watch \"src/**/*.{html,json}\" \"src/**/fonts/*\" dist",
    "watch": "copy-and-watch --watch \"src/**/*.{html,json}\" \"src/**/{fonts,images}/*\" dist"
  }
}
```

## Changelog

### 0.1.2

- Fixed copy on dir bug (by arnarthor)
