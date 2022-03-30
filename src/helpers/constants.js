const ffmpeg = "ffmpeg";
const pngquant = "pngquant";

const CHUNK_IMG = 50;
const CHUNK_VID = 5;
const SUFFIX = "_cmp";

const imageExt = ["jpg", "png", "webp", "bmp", "tiff", "gif"];
const videoExt = ["mp4", "mov", "webm", "mkv", "avi", "wmv", "flv"];

module.exports = {
  ffmpeg,
  pngquant,
  CHUNK_IMG,
  CHUNK_VID,
  SUFFIX,
  imageExt,
  videoExt,
};
