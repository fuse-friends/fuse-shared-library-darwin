#!/usr/bin/env node

const b = require('./build/Release/fuse_example.node')

console.log('fuse was loaded and linked?', !!b.loaded_and_linked())
