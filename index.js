const fs = require('fs')
const { spawn } = require('child_process')
const path = require('path')

const MACFUSE_VERSION = '4.2.1'
const MACFUSE = path.join(__dirname, 'macfuse')
const lib = path.join(MACFUSE, 'libfuse.2.dylib')
const include = path.join(MACFUSE, 'include')

module.exports = {
  lib,
  include,
  configure,
  unconfigure,
  isConfigured
}

function unconfigure (cb) {
  if (!cb) cb = noop
  run([ 'rm', '-rf', '/Library/Filesystems/macfuse.fs' ], cb)
}

function configure (cb) {
  if (!cb) cb = noop

  isConfigured(function (_, yes) {
    if (yes) return cb(null)
    runAll([
      [ 'mkdir', '-p', '/Library/Filesystems/macfuse.fs' ],
      [ 'tar', 'xzf', path.join(MACFUSE, 'macfuse.fs.tgz'), '-C', '/Library/Filesystems/macfuse.fs' ],
      [ 'chown', '-R', 'root:wheel', '/Library/Filesystems/macfuse.fs' ],
      [ 'chmod', '+s', '/Library/Filesystems/macfuse.fs/Contents/Resources/load_macfuse' ],
      writeConfigured,
      [ '/Library/Filesystems/macfuse.fs/Contents/Resources/load_macfuse' ]
    ], cb)

    function writeConfigured (cb) {
      const configured = path.join('/Library/Filesystems/macfuse.fs/configured')
      fs.writeFile(configured, MACFUSE_VERSION, cb)
    }
  })
}

function isConfigured (cb) {
  fs.readFile('/Library/Filesystems/macfuse.fs/configured', 'utf-8', function (err, str) {
    if (err && err.code !== 'ENOENT') return cb(err)
    cb(null, !!str && str.trim() === MACFUSE_VERSION)
  })
}

function runAll (cmds, cb) {
  loop(null)

  function loop (err) {
    if (err) return cb(err)
    if (!cmds.length) return cb(null)
    if (typeof cmds[0] === 'function') return cmds.shift()(loop)
    run(cmds.shift(), loop)
  }
}

function run (args, cb) {
  const child = spawn(args[0], args.slice(1))

  child.stderr.resume()
  child.stdout.resume()

  child.on('exit', function (code) {
    if (code === 1) return cb(new Error('Could not configure fuse: You need to be root'))
    if (code) return cb(new Error('Could not configure fuse: ' + code))
    cb(null)
  })
}

function noop () {}
