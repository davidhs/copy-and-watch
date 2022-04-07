const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const glob = require('glob');
const globParent = require('glob-parent');

require('colors');

/**
 * 
 * @param {string} from 
 * @returns 
 */
function findTarget(from) {
  const parent = parents
    .filter(parent => from.indexOf(parent) >= 0)
    .sort()
    .reverse()[0];
  return path.join(destination, path.relative(parent, from));
}

/**
 * 
 * @param {string} to 
 */
function createDirIfNotExist(to) {
  const dirs = [];
  let dir = path.dirname(to);

  while (dir !== path.dirname(dir)) {
    dirs.push(dir);
    dir = path.dirname(dir);
  }
  
  dirs.reverse();

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
}

/**
 * 
 * @param {string} from 
 */
function copy(from) {
  const pathFrom = path.normalize(from);
  const to = findTarget(pathFrom);
  createDirIfNotExist(to);

  const stats = fs.statSync(pathFrom);

  if (stats.isDirectory()) {
    fs.readdirSync(pathFrom).map(fileName => path.join(pathFrom, fileName))
      .forEach(copy); // recursively copy directory contents
  } else {
    fs.writeFileSync(to, fs.readFileSync(pathFrom));
    console.log('[COPY]'.yellow, pathFrom, 'to'.yellow, to);
  }
}

/**
 * 
 * @param {string} from 
 */
function remove(from) {
  const to = findTarget(from);
  fs.unlinkSync(to);
  console.log('[DELETE]'.red, to);
}

/**
 * Remove directory at path `dir`.
 * 
 * @param {string} dir Path to directory to remove.
 */
function rimraf(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(entry => {
      const entryPath = path.join(dir, entry);
      if (fs.lstatSync(entryPath).isDirectory()) {
        rimraf(entryPath);
      } else {
        console.log('[CLEAN]'.magenta, entryPath);
        fs.unlinkSync(entryPath);
      }
    });
    fs.rmdirSync(dir);
  }
}


let watch = false;
let clean = false;
const sourceGlobs = [];

for (const arg of process.argv.slice(2)) {
  if (arg === '--watch') {
    watch = true;
  } else if (arg === '--clean') {
    clean = true;
  } else {
    sourceGlobs.push(path.normalize(arg));
  }
}

if (sourceGlobs.length < 2) {
  console.error('Not enough arguments: copy-and-watch [options] <sources> <target>'.red);
  process.exit(1);
}

const destination = sourceGlobs.pop(); // pick last path as destination
const parents = [...new Set(sourceGlobs.map(globParent).map(path.normalize))];

if (clean) {
  console.log('Cleaning...');
  rimraf(destination);
}

// initial copy
sourceGlobs.forEach(s => glob.sync(s).forEach(copy));

// watch
if (watch) {
  chokidar.watch(sourceGlobs, {
    ignoreInitial: true
  })
    .on('ready', () => sourceGlobs.forEach(s => console.log('[WATCHING]'.cyan, s)))
    .on('add', copy)
    .on('addDir', copy)
    .on('change', copy)
    .on('unlink', remove)
    .on('unlinkDir', remove)
    .on('error', e => console.log('[ERROR]'.red, e));
}
