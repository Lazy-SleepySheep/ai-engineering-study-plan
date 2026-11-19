// The length of the Hello Interview videos (the mp4s in resource/, not in git), for the Video links of 刷题记录.
// The length is read from the file's header (the "mvhd" box in "moov": timescale and duration) and kept in
// hello-interview-local.json as videoSeconds (page url -> seconds), so a build on a computer without the videos keeps it.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), FILE = path.join(__dirname, 'hello-interview-local.json');

// seconds of an mp4, or 0 when the header cannot be read
function seconds(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const size = fs.fstatSync(fd).size, buf = Buffer.alloc(32);
    const read = (pos, n) => (fs.readSync(fd, buf, 0, n, pos) === n ? buf : null);
    // the boxes from "from" to "to": [type, start of the content, end]
    const boxes = function* (from, to) {
      for (let at = from; at + 8 <= to;) {
        const b = read(at, 16) || read(at, 8);
        if (!b) return;
        let len = b.readUInt32BE(0), head = 8;
        if (len === 1) { len = Number(b.readBigUInt64BE(8)); head = 16; } else if (len === 0) len = to - at;
        if (len < head) return;
        yield [b.toString('latin1', 4, 8), at + head, at + len];
        at += len;
      }
    };
    for (const [type, start, end] of boxes(0, size)) {
      if (type !== 'moov') continue;
      for (const [t, s] of boxes(start, end)) {
        if (t !== 'mvhd') continue;
        const b = read(s, 32);
        if (!b) return 0;
        const [scale, dur] = b[0] === 1 ? [b.readUInt32BE(20), Number(b.readBigUInt64BE(24))] : [b.readUInt32BE(12), b.readUInt32BE(16)];
        return scale ? Math.round(dur / scale) : 0;
      }
    }
    return 0;
  } catch (e) { return 0; } finally { if (fd !== undefined) fs.closeSync(fd); }
}

// reads the length of every video that is on this computer into local.videoSeconds; writes the JSON when that changed
function update(local) {
  const old = local.videoSeconds || {}, now = {};
  for (const [u, p] of Object.entries(local.videos || {})) {
    const s = fs.existsSync(path.join(root, p)) ? seconds(path.join(root, p)) : 0;
    if (s || old[u]) now[u] = s || old[u];
  }
  if (JSON.stringify(now) === JSON.stringify(old)) return;
  local.videoSeconds = now;
  fs.writeFileSync(FILE, JSON.stringify(local, null, 1) + '\n');
}

// 25:13, or 1:05:12 from an hour
const clock = s => {
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};

module.exports = { seconds, update, clock };
