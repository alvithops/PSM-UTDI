import fs from "node:fs";

const file = "index.html";
let h = fs.readFileSync(file, "utf8");

const pairs = [
  ["Latihan Rutin Mingguan", "GBR/Latihan.jpeg"],
  ["Juara Kompetisi Vokal", "GBR/Hadiah.jpeg"],
  ["Penampilan Wisuda", "GBR/Persiapan Tampil.jpeg"],
  ["Penampilan Hargi Guru Besar", "GBR/Persiapan tampil Guru besar.jpeg"],
  ["Healing", "GBR/Makan Bersama.jpeg"],
];

let done = 0;
for (const [alt, src] of pairs) {
  const re = new RegExp(
    `(<img class="gallery-photo" src="")( alt="${alt}" loading="lazy"\\s*/>)`
  );
  if (re.test(h)) {
    h = h.replace(re, `<img class="gallery-photo" src="${src}" alt="${alt}" loading="lazy" />`);
    done++;
  } else {
    console.log("SKIP (pattern tidak ditemukan):", alt);
  }
}

fs.writeFileSync(file, h);
console.log("Tile diisi:", done, "dari", pairs.length);
