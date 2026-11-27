// Builds web sizes of the setup photos from the camera originals (originals/<n>.JPG, not committed).
// Each setup gets <id>.jpg (2400 wide) plus <id>-1200.jpg and <id>-3600.jpg for srcset.
const sharp = require('sharp');
const MAP = { 6: '208c4f23dfdfe4243df4a86635203f37', 1: '038dec353b5bd702311097efb1b9228d', 2: '113ecd6e6a3d2de8944e3757f1945c32',
  7: '2ac233ffaa36829ee7a6988f671bcf5f', 4: 'dd85524628dcc9ee4b96e61cac0a9b34', 5: 'b898d02d75c253e89b08c320c1cad962', 3: 'fdcfcc88f60a0534d61a1283ace3c717' };
(async () => {
  for (const [n, id] of Object.entries(MAP)) {
    for (const [w, suffix] of [[1200, '-1200'], [2400, ''], [3600, '-3600']]) {
      await sharp(`originals/${n}.JPG`).rotate().resize({ width: w }).withMetadata({ exif: {} }).toColourspace('srgb')
        .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(`public/images/${id}${suffix}.jpg`);
    }
    console.log('setup photo', n, '->', id);
  }
})();
