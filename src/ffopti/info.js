let { execSync } = require("child_process");
const { Buffer } = require("buffer");

const { getValidFiles } = require("./files.js");
const { isImage, isVideo } = require("../helpers/utils.js");
const { ffprobe } = require("../helpers/constants.js");

const imgParams = {
  stream: ["codec_name", "width", "height", "display_aspect_ratio"],
  format: ["filename", "format_name", "format_long_name", "size"],
};

const videoParams = {
  stream: [
    ...imgParams.stream,
    "codec_type",
    "r_frame_rate",
    "duration",
    "bit_rate",
    "sample_rate",
  ],
  format: [...imgParams.format, "duration", "bit_rate"],
};

async function showInfo(files) {
  if (!files || files.length < 0) return;
  let validFiles = await getValidFiles(files, true);
  validFiles.forEach((file) => {
    try {
      let params;
      if (isImage(file)) {
        params = imgParams;
      } else if (isVideo(file)) {
        params = videoParams;
      }

      let cmd = `${ffprobe} -i "${file}" -v error -unit -prefix -sexagesimal -of json -show_entries "format=${params.format.join(
        ","
      )} : stream=${params.stream.join(",")} : format_tags : stream_tags"`;

      let out = execSync(cmd);
      if (Buffer.isBuffer(out)) {
        out = JSON.parse(out.toString());
      } else out = JSON.parse(out);
      out = {
        path: out["format"]["filename"],
        container: out["format"],
        streams: out["streams"],
      };
      console.log(JSON.stringify(out, null, 4));
    } catch (err) {
      console.error(err);
    }
  });
}

module.exports = {
  showInfo,
};
