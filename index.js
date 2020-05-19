const fs = require('fs')
const { spawn } = require('child_process')
const path = require('path')

const OSXFUSE = path.join(__dirname, 'osxfuse')
const lib = path.join(OSXFUSE, 'libosxfuse.dylib')
const include = path.join(OSXFUSE, 'include')

module.exports = {
  lib,
  include,
  configure,
  unconfigure,
  isConfigured
}

function unconfigure (cb) {
  if (!cb) cb = noop
  run([ 'rm', '-rf', '/Library/Filesystems/osxfuse.fs' ], cb)
}

function configure (cb) {
  if (!cb) cb = noop

  isConfigured(function (_, yes) {
    if (yes) return cb(null)
    runAll([
      [ 'mkdir', '-p', '/Library/Filesystems/osxfuse.fs' ],
      [ 'tar', 'xzf', path.join(OSXFUSE, 'osxfuse.fs.tgz'), '-C', '/Library/Filesystems/osxfuse.fs' ],
      [ 'chown', '-R', 'root:wheel', '/Library/Filesystems/osxfuse.fs' ],
      [ 'chmod', '+s', '/Library/Filesystems/osxfuse.fs/Contents/Resources/load_osxfuse' ],
      [ 'touch', path.join('/Library/Filesystems/osxfuse.fs/configured') ],
      [ '/Library/Filesystems/osxfuse.fs/Contents/Resources/load_osxfuse' ]
    ], cb)
  })
}

function isConfigured (cb) {
  fs.stat('/Library/Filesystems/osxfuse.fs/configured', function (err, st) {
    if (err && err.code !== 'ENOENT') return cb(err)
    cb(null, !!st)
  })
}

function runAll (cmds, cb) {
  loop(null)

  function loop (err) {
    if (err) return cb(err)
    if (!cmds.length) return cb(null)
    run(cmds.shift(), loop)
  }
}

function run (args, cb) {
  const child = spawn(args[0], args.slice(1))

  child.stderr.pipe(process.stdout)

  child.stderr.resume()
  child.stdout.resume()

  child.on('exit', function (code) {
    if (code === 1) return cb(new Error('Could not configure fuse: You need to be root'))
    if (code) return cb(new Error('Could not configure fuse: ' + code))
    cb(null)
  })
}

function noop () {}
