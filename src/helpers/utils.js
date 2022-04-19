const path = require("path");
const { imageExt, videoExt } = require("./constants");

function getExt(input) {
  let ext = path.extname(input).toLowerCase();
  if (ext && ext[0] === ".") ext = ext.substring(1);
  if (ext === "jpeg") ext = "jpg";
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

function isImage(input) {
  return imageExt.includes(getExt(input));
}

function isVideo(input) {
  return videoExt.includes(getExt(input));
}

function isValidExt(input) {
  let validExt = [...imageExt, ...videoExt];
  return validExt.includes(getExt(input));
}

module.exports = {
  getExt,
  addSuffix,
  isImage,
  isVideo,
  isValidExt,
};
