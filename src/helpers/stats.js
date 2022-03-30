const cstats = { img: 0, vid: 0 };

function showStats(timer) {
  console.timeEnd(timer);
  console.log(`images compressed: ${cstats.img}`);
  console.log(`videos compressed: ${cstats.vid}`);
}

function withStats(func) {
  return async function (args) {
    const timer = "compression_time";
    console.time(timer);
    await func(args);
    showStats(timer);
  };
}

module.exports = { withStats, cstats };
