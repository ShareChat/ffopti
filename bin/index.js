#! /usr/bin/env node
let { exec } = require("child_process");
const yargs = require("yargs");
const path = require("path");
const fs = require("fs/promises");
const fse = require("fs-extra");
const dir = require("node-dir");
const util = require("util");
const utils = require("./utils.js");

exec = util.promisify(exec);

const ffmpeg = "ffmpeg";
const pngquant = "pngquant";

const CHUNK_IMG = 50;
const CHUNK_VID = 5;
const SUFFIX = "_cmp";
const imageExt = ["jpg", "png", "webp", "bmp", "tiff", "gif"];
const videoExt = ["mp4", "mov", "webm", "mkv", "avi", "wmv", "flv"];
const validExt = [...imageExt, ...videoExt];

let { yargsOptions, getExt, addSuffix } = utils;
let argv = yargs
  .options(yargsOptions)
  .usage(
    `
  Compress image or video files.
  
  usage: $0 [options] [input] [input]...
  where input is file or directory.
  
  Supported formats
  Images: ${imageExt.join(", ")}
  Videos: ${videoExt.join(", ")}
  `
  )
  .demandCommand(1, "Atleast one input is required").argv;

let { _, replace, suffix, silent, stats } = argv;
suffix = suffix && suffix.length > 0 ? suffix : SUFFIX;
const cstats = { img: 0, vid: 0 };
const timer = "compression_time";

const validFiles = [];
const validFilesChunks = [];

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

function chunk() {
  let tempImg = [];
  let tempVid = [];

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

async function compressFiles() {
  for (const inputFiles of validFilesChunks) {
    await Promise.all(
      inputFiles.map((inp) => {
        return comp(inp);
      })
    );
  }
}

function showStats() {
  console.timeEnd(timer);
  console.log(`images compressed: ${cstats.img}`);
  console.log(`videos compressed: ${cstats.vid}`);
}

async function compress() {
  stats && console.time(timer);
  await getValidFiles(_);
  chunk();
  await compressFiles();
  stats && showStats();
}

if (_ && _.length > 0) compress();
