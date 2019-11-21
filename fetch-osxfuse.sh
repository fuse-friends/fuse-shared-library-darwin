#!/usr/bin/env bash

LATEST_DMG='https://github.com/osxfuse/osxfuse/releases/download/osxfuse-3.10.3/osxfuse-3.10.3.dmg'
DMG_VOLUME='/Volumes/FUSE for macOS'
DIRNAME="$(dirname $0)"
OUT="$DIRNAME/osxfuse"

rm -rf "$OUT"
mkdir -p "$OUT"

curl "$LATEST_DMG" -Lo "$OUT/osxfuse-latest.dmg"

[ -d "$DMG_VOLUME" ] && umount "$DMG_VOLUME"
hdiutil attach "$OUT/osxfuse-latest.dmg"
pkgutil --expand-full "$DMG_VOLUME/FUSE for macOS.pkg" "$OUT/unpacked"
umount "$DMG_VOLUME"

mv "$OUT/unpacked/Core.pkg/Payload/Library/Filesystems/osxfuse.fs" "$OUT/"
mv "$OUT/unpacked/Core.pkg/Payload/usr/local/include/osxfuse/fuse" "$OUT/include"
cp "$OUT/unpacked/Core.pkg/Payload/usr/local/lib/libosxfuse.dylib" "$OUT/"

rm -rf "$OUT/unpacked" "$OUT/osxfuse-latest.dmg"

echo 'cd "$1"' > "$OUT/setup-links.sh"
chmod +x "$OUT/setup-links.sh"
node "$DIRNAME/generate-links.js" "$OUT/osxfuse.fs/Contents/Extensions" >> "$OUT/setup-links.sh"

install_name_tool -id "@loader_path/libosxfuse.dylib" "$OUT/libosxfuse.dylib"
