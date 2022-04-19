const { compressFiles } = require("./ffopti/compress.js");
const { getValidFiles, chunkFiles } = require("./ffopti/files.js");
const { showInfo } = require("./ffopti/info.js");
const { _, stats, info } = require("./helpers/options.js");
const { withStats } = require("./helpers/stats.js");

async function compress() {
  const validFiles = await getValidFiles(_);
  const validFilesChunks = chunkFiles(validFiles);
  await compressFiles(validFilesChunks);
}

function ffopti() {
  if (info && info.length > 0) {
    showInfo(info);
  }
  if (_ && _.length > 0) {
    if (stats) withStats(compress)();
    else compress();
  }
}

module.exports = { ffopti };
