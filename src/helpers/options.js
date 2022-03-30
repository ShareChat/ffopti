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
  stats: {
    describe: "Show compression stats",
    type: "boolean",
  },
};

const argv = yargs
  .options(options)
  .usage(usage)
  .demandCommand(1, "Atleast one input is required").argv;

if (!argv.suffix || argv.suffix.length <= 0) {
  argv.suffix = SUFFIX;
}

module.exports = argv;
