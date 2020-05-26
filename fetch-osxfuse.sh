#!/usr/bin/env bash

cd "$(dirname $0)"

# if you bump the version here remember to update it in index.js also.
LATEST_DMG='https://github.com/osxfuse/osxfuse/releases/download/osxfuse-3.10.4/osxfuse-3.10.4.dmg'
DMG_VOLUME='/Volumes/FUSE for macOS'
DIRNAME="$PWD"
OUT="$PWD/osxfuse"

rm -rf "$OUT"
mkdir -p "$OUT"

curl "$LATEST_DMG" -Lo "$OUT/osxfuse-latest.dmg"

[ -d "$DMG_VOLUME" ] && umount "$DMG_VOLUME"
hdiutil attach "$OUT/osxfuse-latest.dmg"
pkgutil --expand-full "$DMG_VOLUME/FUSE for macOS.pkg" "$OUT/unpacked"
umount "$DMG_VOLUME"
mkdir -p "$OUT/"

cd "$OUT/unpacked/Core.pkg/Payload/Library/Filesystems/osxfuse.fs"
tar czf "$OUT/osxfuse.fs.tgz" "."
mv "$OUT/unpacked/Core.pkg/Payload/usr/local/include/osxfuse/fuse" "$OUT/include"
cp "$OUT/unpacked/Core.pkg/Payload/usr/local/lib/libosxfuse.dylib" "$OUT/"

rm -rf "$OUT/unpacked" "$OUT/osxfuse-latest.dmg"

install_name_tool -id "@loader_path/libosxfuse.dylib" "$OUT/libosxfuse.dylib"
