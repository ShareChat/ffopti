let { exec } = require("child_process");
const fs = require("fs/promises");
const util = require("util");

const { replace, silent } = require("../helpers/options.js");
const { getExt, addSuffix } = require("../helpers/utils.js");
const { cstats } = require("../helpers/stats.js");
const {
  ffmpeg,
  pngquant,
  imageExt,
  videoExt,
} = require("../helpers/constants.js");

exec = util.promisify(exec);

async function compress(inp) {
  try {
    let ext = getExt(inp);
    let tmp = addSuffix(inp, "#");
    await fs.rename(inp, tmp);

    let cmd;
    if (imageExt.includes(ext)) {
      cstats.img += 1;
      if (ext === "png")
        cmd = `${pngquant} -f --strip --quality 0-80 "${tmp}" -o "${inp}"`;
      else if (ext === "jpg")
        cmd = `${ffmpeg} -loglevel 16 -i "${tmp}" -y -q:v 7 "${inp}"`;
      else cmd = `${ffmpeg} -loglevel 16 -i "${tmp}" -y "${inp}"`;
    } else if (videoExt.includes(ext)) {
      cstats.vid += 1;
      if (ext === "mp4")
        cmd = `${ffmpeg} -loglevel 16 -i "${tmp}" -y -map_metadata -1 -movflags +faststart -c:v libx264 -c:a aac -b:a 64k -vf "scale=-2:min(720\\,trunc(ih/2)*2)" -profile:v main -r 30 -b:v 1000k "${inp}"`;
      else
        cmd = `${ffmpeg} -loglevel 16 -i "${tmp}" -y -map_metadata -1 -vf "scale=-2:min(720\\,trunc(ih/2)*2)" -r 30 -b:v 1000k "${inp}"`;
    }

    try {
      await exec(cmd);
      silent || console.log(`${inp} compressed`);
      await fs.unlink(tmp);
    } catch (err) {
      console.error(`${inp} compression failed: `, err);
      replace ? await fs.rename(tmp, inp) : await fs.unlink(tmp);
    }
  } catch (err) {
    console.error(err);
  }
}

async function compressFiles(validFilesChunks = []) {
  for (const inputFiles of validFilesChunks) {
    await Promise.all(
      inputFiles.map((inp) => {
        return compress(inp);
      })
    );
  }
}

module.exports = {
  compressFiles,
};
