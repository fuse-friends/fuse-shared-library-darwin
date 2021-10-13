# fuse-shared-library-darwin

A module containing the dylib needed to run FUSE on Mac (darwin).

```
npm install fuse-shared-library-darwin
```

Includes programmatic access to setup the kernel extension as well
as part of an install step.

## Usage

``` js
const libfuse = require('fuse-shared-library-darwin')

console.log(libfuse.lib) // path to the shared library
console.log(libfuse.include) // path to the include folder

// tells you if libfuse has been configured on this machine
libfuse.isConfigured(function (err, yes) { })

// configure libfuse on this machine (requires root access)
// but only needs to run once
libfuse.configure(function (err) { })

// unconfigures libfuse on this machine
libfuse.unconfigure(function (err) { })
```

You should configure libfuse using the above API before using the
shared library, otherwise the program using fuse will error.

When configuring the only thing this module does is copy
the fuse kernel extension and some helpers to `/Library/Filesystems/macfuse.fs`,
and tries to load the kernel extension once.

The first time it loads on mac a user prompt will trigger that allows
you to accept the kernel extension.

You can remove the folder manually if you want to remove fuse or use the
`unconfigure` api listed above.

The shared library itself is contained within the module and not copied
or installed anywhere. You should move the shared library next to your
program after linking it as that is where your binary will try and load it from.

Using a GYP file this can be done like this:

```
{
  "targets": [{
    "target_name": "fuse_example",
    "include_dirs": [
      # include it like this
      "<!(node -e \"require('fuse-shared-library-darwin/include')\")"
    ],
    "libraries": [
      # link it like this
      "<!(node -e \"require('fuse-shared-library-darwin/lib')\")"
    ],
    "sources": [
      "your_program.cc"
    ]
  }, {
    # setup a postinstall target that copies the shared library
    # next to the produces node library
    "target_name": "postinstall",
    "type": "none",
    "dependencies": ["fuse_example"],
    "copies": [{
      "destination": "build/Release",
      "files": [ "<!(node -e \"require('fuse-shared-library-darwin/lib')\")" ],
    }]
  }]
}
```

## Development

Use the `./fetch-macfuse.sh` script to fetch macFUSE
and unwrap the shared library and more.

## License

MIT

See the [macFUSE license](https://github.com/macfuse/macfuse/blob/master/LICENSE.txt) for the terms involving commercial redistribution,
for the macFUSE part.
