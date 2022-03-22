#! /usr/bin/env node
let { exec } = require("child_process");
const yargs = require("yargs");
const path = require("path");
const fs = require("fs/promises");
const fse = require("fs-extra");
const dir = require("node-dir");
const util = require("util");
const pathToFfmpeg = require("ffmpeg-static");
const ffmpeg = require("ffmpeg-cli");
const utils = require("./utils.js");

exec = util.promisify(exec);

const SUFFIX = "_cmp";
const imageExt = ["jpg", "png", "webp", "bmp", "tiff", "gif"];
const videoExt = ["mp4", "mov", "webm", "mkv", "avi", "wmv", "flv"];
const validExt = [...imageExt, ...videoExt];

let { yargsOptions, getExt, addSuffix } = utils;
let argv = yargs
  .options(yargsOptions)
  .usage(
    "Compress images or videos files.\n\n$0 [options] [input] [input]...\n where input is file or directory."
  )
  .demandCommand(1, "Atleast one input is required").argv;
// console.log(argv);
let { _, replace, suffix, silent, stats } = argv;
suffix = suffix && suffix.length > 0 ? suffix : SUFFIX;
const cstats = { img: 0, vid: 0 };
const timer = "compression_time";

const validFiles = [];

async function getValidFiles(args) {
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
}

async function comp(inp) {
  try {
    let ext = getExt(inp);
    let tmp = addSuffix(inp, "#");
    await fs.rename(inp, tmp);

    let cmd;
    if (imageExt.includes(ext)) {
      cstats.img += 1;
      if (ext === "png")
        cmd = `pngquant -f --strip --quality 0-80 "${tmp}" -o "${inp}"`;
      else if (ext === "jpg")
        cmd = `ffmpeg -loglevel 16 -i "${tmp}" -y -q:v 7 "${inp}"`;
      else cmd = `ffmpeg -loglevel 16 -i "${tmp}" -y "${inp}"`;
    } else if (videoExt.includes(ext)) {
      cstats.vid += 1;
      if (ext === "mp4")
        cmd = `ffmpeg -loglevel 16 -i "${tmp}" -y -map_metadata -1 -movflags +faststart -c:v libx264 -c:a aac -b:a 64k -vf "scale=-2:min(720\\,trunc(ih/2)*2)" -profile:v main -r 30 -b:v 1000k "${inp}"`;
      else
        cmd = `ffmpeg -loglevel 16 -i "${tmp}" -y -map_metadata -1 -vf "scale=-2:min(720\\,trunc(ih/2)*2)" -r 30 "${inp}"`;
    }

    try {
      await exec(cmd);
      silent || console.log(`${inp} compressed`);
      await fs.rm(tmp);
    } catch (err) {
      console.error(`${inp} compression failed: `, err);
      replace ? await fs.rename(tmp, inp) : await fs.rm(tmp);
    }
  } catch (err) {
    console.error(err);
  }
}

function compressFiles() {
  return Promise.all(
    validFiles.map((inp) => {
      return comp(inp);
    })
  );
}

function showStats() {
  console.timeEnd(timer);
  console.log(`images compressed: ${cstats.img}`);
  console.log(`videos compressed: ${cstats.vid}`);
}

async function compress() {
  stats && console.time(timer);
  await getValidFiles(_);
  await compressFiles();
  stats && showStats();
}

if (_ && _.length > 0) compress();

// console.log(ffmpeg.path, pathToFfmpeg);
// console.log(ffmpeg.runSync("-version"));
// exec(`${pathToFfmpeg} -version`, (err, res) => console.log(res));
