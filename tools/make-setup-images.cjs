// Builds web sizes of the setup photos from the camera originals (originals/<n>.JPG, not committed).
// Photo n is Setup n: public/images/setup-<n>.jpg (2400 wide) plus -1200 and -3600 versions for srcset.
const sharp = require('sharp');
(async () => {
  for (let n = 1; n <= 7; n++) {
    for (const [w, suffix] of [[1200, '-1200'], [2400, ''], [3600, '-3600']]) {
      await sharp(`originals/${n}.JPG`).rotate().resize({ width: w }).toColourspace('srgb')
        .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(`public/images/setup-${n}${suffix}.jpg`);
    }
    console.log('setup photo', n);
  }
})();
