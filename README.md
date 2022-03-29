# ffopti

Compress image or video files seamlessly.

ffopti is a CLI tool built on top of ffmpeg for image and video compression and pngquant for 8-bit indexed png image compression.

Easiely compress batch of files and folders simultaneously for faster compression.

Read more about it from the [blog](https://sharechat.com/blogs/engineering/making-devs-lives-easier-local-assets-optimization-services-part-i).

## Install

Install via brew

`brew install ffopti`

## Usage

`ffopti [options] [input] [input]...`

where input is file or directory.

### Supported formats

**Images**: jpg, png, webp, bmp, tiff, gif  
**Videos**: mp4, mov, webm, mkv, avi, wmv, flv

## Options

`--help`  
 Show help

`--version`  
Show version number

`-r`, `--replace`  
Replace original

`-s`, `--silent`  
Run quietly with no info

`--suffix`  
Final compressed path suffix (default is \_cmp)

`--stats`  
Show compression stats
