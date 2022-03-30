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

module.exports = {
  getExt,
  addSuffix,
};
