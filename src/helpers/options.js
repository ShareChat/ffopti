const yargs = require("yargs");
const { SUFFIX, imageExt, videoExt } = require("./constants.js");

const usage = `
Compress image or video files.

usage: $0 [options] [input] [input]...
where input is file or directory.

Supported formats
Images: ${imageExt.join(", ")}
Videos: ${videoExt.join(", ")}
`;

const options = {
  r: {
    alias: "replace",
    describe: "Replace original",
    type: "boolean",
  },
  s: {
    alias: "silent",
    describe: "Run quietly with no info",
    type: "boolean",
  },
  suffix: {
    default: SUFFIX,
    describe: "Final compressed path suffix",
    type: "string",
  },
  i: {
    alias: "info",
    describe: "Print image/video information",
    type: "array",
    requiresArg: true,
  },
  stats: {
    describe: "Show compression stats",
    type: "boolean",
  },
};

const y = yargs.options(options).usage(usage);
const argv = y.argv;

if (!argv.suffix || argv.suffix.length <= 0) {
  argv.suffix = SUFFIX;
}

if (!(argv._ && argv._.length > 0) && !argv.info) {
  y.showHelp();
}

module.exports = argv;
