// Builds optimized images in public/img from originals downloaded from groomchik.ru (see src/data/media.ts for sources)
import sharp from 'sharp';
const R = '../raw/';
const jobs = [
  ['03_IMG_-avulxe_1.png', 'logo', [270], 'png'],
  ['05_RmMmmkAEoWzlv-eimYqO.png', 'yorkie-red-bow', [520, 900]],
  ['15_imgonline-com-ua-Res.png', 'inna', [480, 835]],
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

// ---- Unified look for the works gallery and master photos ----
// Busy competition shots are not used. Kept photos get the same 4:5 crop and a soft,
// slightly warm matte grade; cut-outs get the same gentle colour treatment.
const grade = (img, alpha) => {
  let p = img.modulate({ saturation: 0.86, brightness: 1.03 }).recomb([
    [1.04, 0, 0],
    [0, 1.0, 0],
    [0, 0, 0.95],
  ])
  if (!alpha) p = p.linear(0.93, 14) // lift blacks, soften contrast
  return p
}
const styled = [
  // [source, name, crop {left, top, width, height} | null, cutout]
  ['41_1000015370.jpg', 'work-bichons', { left: 100, top: 300, width: 760, height: 950 }],
  ['40_1000015369.jpg', 'work-poodle', { left: 0, top: 155, width: 900, height: 1125 }],
  ['39_1000015455.jpg', 'work-bichons-inna', { left: 0, top: 290, width: 720, height: 900 }],
  ['17_IMG_3004.JPG', 'master-alena', { left: 90, top: 20, width: 345, height: 431 }],
  ['09_087Po51-nYs-Photoroo.png', 'work-cat-towel', null, true],
  ['14_IMG_20251118_013612_.png', 'work-yorkie', null, true],
  ['12_IMG_20221110_231412_.png', 'work-westie', null, true],
  ['13_IMG_20251118_013820_.png', 'work-frenchie', null, true],
  ['08_IMG_20251119_134958_.png', 'work-cat-molt', null, true],
  ['10_IMG_20251118_013459_.png', 'work-cat-british', null, true],
  ['11_Screenshot_20251118-.png', 'work-puppy-bath', null, true],
]
for (const [src, name, crop, cutout] of styled) {
  const base = cutout ? await sharp(R + src).trim().toBuffer() : await sharp(R + src).rotate().extract(crop).toBuffer()
  for (const w of [480, 960]) {
    await grade(sharp(base).resize({ width: w, withoutEnlargement: true }), cutout)
      .webp({ quality: 80, alphaQuality: 90 })
      .toFile(`public/img/${name}-${w}.webp`)
  }
}
const sizes2 = {}
for (const f of fs.readdirSync('public/img')) {
  const m = await sharp('public/img/' + f).metadata()
  sizes2[f] = [m.width, m.height]
}
fs.writeFileSync('src/data/imageSizes.json', JSON.stringify(sizes2, null, 1))
