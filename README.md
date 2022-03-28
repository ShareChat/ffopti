# ffopti
Compress image or video files seamlessly.

ffopti is a CLI tool built on top of ffmpeg for image and video compression and pngquant for 8-bit indexed png image compression. 
Also add Automator workflows to easily compress files via right click context menu option.

## Install
Install via brew
`brew install ffopti`

## Usage
`ffopti [options] [input] [input]...`
where input is file or directory.

Supported formats
Images: jpg, png, webp, bmp, tiff, gif
Videos: mp4, mov, webm, mkv, avi, wmv, flv

## Options
`--help`            Show help [boolean]
`--version`         Show version number [boolean]
`-r`, `--replace`   Replace original [boolean]
`-s`, `--silent`    Run quietly with no info [boolean]
`--suffix`          Final compressed path suffix [string] [default: "_cmp"]
`--stats`           Show compression stats [boolean]
