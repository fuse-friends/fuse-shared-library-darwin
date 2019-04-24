const fs = require('fs')

process.chdir(process.argv[2])

for (const n of fs.readdirSync('.')) {
  try {
    console.log('ln -fs', fs.readlinkSync(n), n)
  } catch (_) { }
}
