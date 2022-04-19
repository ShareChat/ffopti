const fse = require("fs-extra");
const dir = require("node-dir");

const { replace, suffix } = require("../helpers/options.js");
const {
  addSuffix,
  isImage,
  isVideo,
  isValidExt,
} = require("../helpers/utils.js");
const { CHUNK_IMG, CHUNK_VID } = require("../helpers/constants.js");

async function getValidFiles(args, rep = replace, suf = suffix) {
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
        if (isValidExt(inp)) {
          if (rep) {
            validFiles.push(inp);
            continue;
          }
          let out = addSuffix(inp, suf);
          fse.copyFileSync(inp, out);
          validFiles.push(out);
        } else {
          console.log(`${inp} file type not supported`);
        }
      } else if (fileStat.isDirectory()) {
        let out;
        if (rep) {
          out = inp;
        } else {
          out = addSuffix(inp, suf);
          fse.emptyDirSync(out);
          fse.copySync(inp, out);
        }
        files = await dir.promiseFiles(out);
        files.forEach((file) => {
          if (isValidExt(file)) validFiles.push(file);
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
    if (isImage(inp)) {
      tempImg.push(inp);
      if (tempImg.length >= CHUNK_IMG) {
        validFilesChunks.push(tempImg);
        tempImg = [];
      }
    } else if (isVideo(inp)) {
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
