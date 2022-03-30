const fse = require("fs-extra");
const dir = require("node-dir");

const { replace, suffix } = require("../helpers/options.js");
const { getExt, addSuffix } = require("../helpers/utils.js");
const {
  CHUNK_IMG,
  CHUNK_VID,
  imageExt,
  videoExt,
} = require("../helpers/constants.js");

async function getValidFiles(args) {
  const validExt = [...imageExt, ...videoExt];
  let validFiles = [];

  if (!args || !Array.isArray(args)) return;
  for (const inp of args) {
    try {
      let fileStat;
      try {
        fileStat = fse.lstatSync(inp);
      } catch (err) {
        console.log(`${inp} is not a valid file or directory`);
        continue;
      }
      if (fileStat.isFile()) {
        if (validExt.includes(getExt(inp))) {
          if (replace) {
            validFiles.push(inp);
            continue;
          }
          let out = addSuffix(inp, suffix);
          fse.copyFileSync(inp, out);
          validFiles.push(out);
        } else {
          console.log(`${inp} file type not supported`);
        }
      } else if (fileStat.isDirectory()) {
        let out;
        if (replace) {
          out = inp;
        } else {
          out = addSuffix(inp, suffix);
          fse.emptyDirSync(out);
          fse.copySync(inp, out);
        }
        files = await dir.promiseFiles(out);
        files.forEach((file) => {
          if (validExt.includes(getExt(file))) validFiles.push(file);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  return validFiles;
}

function chunkFiles(validFiles) {
  let tempImg = [];
  let tempVid = [];
  let validFilesChunks = [];

  if (!validFiles || validFiles.length <= 0) return [];

  for (const inp of validFiles) {
    let ext = getExt(inp);
    if (imageExt.includes(ext)) {
      tempImg.push(inp);
      if (tempImg.length >= CHUNK_IMG) {
        validFilesChunks.push(tempImg);
        tempImg = [];
      }
    } else if (videoExt.includes(ext)) {
      tempVid.push(inp);
      if (tempVid.length >= CHUNK_VID) {
        validFilesChunks.push(tempVid);
        tempVid = [];
      }
    }
  }
  if (tempImg.length > 0) validFilesChunks.push(tempImg);
  if (tempVid.length > 0) validFilesChunks.push(tempVid);

  return validFilesChunks;
}

module.exports = { getValidFiles, chunkFiles };
