// Builds optimized images in public/img from originals downloaded from groomchik.ru (see src/data/media.ts for sources)
import sharp from 'sharp';
const R = '../raw/';
const jobs = [
  ['03_IMG_-avulxe_1.png', 'logo', [270], 'png'],
  ['05_RmMmmkAEoWzlv-eimYqO.png', 'yorkie-red-bow', [520, 900]],
  ['14_IMG_20251118_013612_.png', 'yorkie-pink-bow', [480, 800]],
  ['12_IMG_20221110_231412_.png', 'westie', [480, 800]],
  ['13_IMG_20251118_013820_.png', 'french-bulldog', [480, 800]],
  ['11_Screenshot_20251118-.png', 'puppy-bath', [400, 560]],
  ['08_IMG_20251119_134958_.png', 'cat-express', [480, 800]],
  ['09_087Po51-nYs-Photoroo.png', 'cat-towel', [480, 800]],
  ['10_IMG_20251118_013459_.png', 'cat-british', [480, 800]],
  ['39_1000015455.jpg', 'creative-bichons-inna', [480, 720]],
  ['40_1000015369.jpg', 'creative-poodle', [480, 900]],
  ['41_1000015370.jpg', 'creative-bichons', [480, 900]],
  ['34_1000016268.jpg', 'yorkie-show', [480, 900]],
  ['52_77UHjnk5ftQ.jpg', 'yorkie-table', [480, 900]],
  ['56_jrGbRXJQiBQ.jpg', 'bichon-rosette', [480, 900]],
  ['46_-UH_453RttU.jpg', 'poodle-trophies', [480, 900]],
  ['15_imgonline-com-ua-Res.png', 'inna', [480, 835]],
  ['17_IMG_3004.JPG', 'alena', [525]],
  ['16_IMG_3084-Photoroom.png', 'inna-award', [700]],
  ['30_ZrwCWkGMgqA.jpg', 'inna-achv-1', [600]],
  ['32_1000016274.jpg', 'inna-achv-2', [600]],
  ['36_qdrFYnozwSROdbPoj5rW.jpg', 'inna-achv-3', [600]],
  ['43_7QOhVPzn6bS53a-iNhf0.jpg', 'inna-achv-4', [600]],
  ['47_vfRUXvWcxik.jpg', 'inna-achv-5', [600]],
  ['44_AXknecHmaFsPCLWlcfQI.jpg', 'inna-achv-6', [600]],
  ['59_IMG_20210317_101532.jpg', 'cert-1', [520]],
  ['61_IMG_20210317_101550.jpg', 'cert-2', [520]],
  ['62_IMG_20210317_101542.jpg', 'cert-3', [520]],
  ['67_IMG_20210317_101645.jpg', 'cert-4', [520]],
  ['70_IMG_20210317_101802.jpg', 'cert-5', [520]],
  ['72_IMG_20210317_101829.jpg', 'cert-6', [520]],
  ['33_1000016271.jpg', 'school-forum', [900]],
  ['26_1652301_b96f29ae_9.jpeg', 'school-cert-sample', [495], 'jpg'],
  ['18_1652301_b96f29ae_1.jpeg', 'price-promo', [495], 'jpg'],
  ['19_1652301_b96f29ae_2.jpeg', 'price-dogs-haircut', [495], 'jpg'],
  ['20_1652301_b96f29ae_3.jpeg', 'price-dogs-express', [495], 'jpg'],
  ['21_1652301_b96f29ae_4.jpeg', 'price-dogs-trimming', [495], 'jpg'],
  ['22_1652301_b96f29ae_5.jpeg', 'price-cats', [495], 'jpg'],
  ['23_1652301_b96f29ae_6.jpeg', 'price-extras', [495], 'jpg'],
  ['24_1652301_b96f29ae_7.jpeg', 'price-spa', [495], 'jpg'],
];
for (const [src, name, widths, fmt] of jobs) {
  for (const w of widths) {
    // cut-out PNGs carry empty transparent margins: trim them so frames fit the animal
    const input = src.endsWith('.png') && !fmt ? await sharp(R + src).trim().toBuffer() : R + src;
    const meta = await sharp(input).metadata();
    const width = Math.min(w, meta.width);
    let p = sharp(input).rotate().resize({ width, withoutEnlargement: true });
    const suffix = widths.length > 1 ? `-${w}` : '';
    if (fmt === 'png') await p.png({ compressionLevel: 9 }).toFile(`public/img/${name}${suffix}.png`);
    else if (fmt === 'jpg') await p.jpeg({ quality: 86, mozjpeg: true }).toFile(`public/img/${name}${suffix}.jpg`);
    else await p.webp({ quality: 80, alphaQuality: 90 }).toFile(`public/img/${name}${suffix}.webp`);
  }
}
console.log('done');

// size manifest: lets components reserve aspect ratio before images load
import fs from 'node:fs';
const sizes = {};
for (const f of fs.readdirSync('public/img')) {
  const m = await sharp('public/img/' + f).metadata();
  sizes[f] = [m.width, m.height];
}
fs.writeFileSync('src/data/imageSizes.json', JSON.stringify(sizes, null, 1));
