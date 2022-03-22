const path = require("path");

function getExt(input) {
  let ext = path.extname(input).toLowerCase();
  if (ext && ext[0] === ".") ext = ext.substring(1);
  return ext;
}

function addSuffix(input, suffix) {
  if (!input) return "";
  let base = "";
  let { dir, name, ext } = path.parse(input);
  if (dir.length > 0 && dir[dir.length - 1] !== "/") {
    base = `${dir}/${name}`;
  } else {
    base = `${dir}${name}`;
  }
  return `${base}${suffix}${ext}`;
}

const yargsOptions = {
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
    default: "_cmp",
    describe: "Final compressed path suffix",
    type: "string",
  },
  stats: {
    describe: "Show compression stats",
    type: "boolean",
  },
};

module.exports = {
  yargsOptions,
  getExt,
  addSuffix,
};
