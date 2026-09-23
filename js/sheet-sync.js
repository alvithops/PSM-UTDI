/* ============================================================
   sheet-sync.js — Tarik data Google Form (via Google Sheets)
   ke dashboard Symphony Choir.
   ─────────────────────────────────────────────────────────────
   LANGKAH 30 DETIK (sekali, di akun Google Anda):
   1) Buka spreadsheet hasil Google Form (Respons → Google Sheets).
   2) File → Bagikan → "Siapa pun yang memiliki link" → "Penayang".
   3) File → Bagikan → "Publikasikan ke web" → Sheet1 → format CSV
      → salin URL-nya (pola ".../spreadsheets/d/e/PUBOUTKEY/pub?gid=0&single=true&output=csv").
   4) Tempel URL itu ke konstanta SHEET_CSV_URL di bawah.
   Data otomatis masuk dashboard → grafik + tabel + tombol Excel.
   ============================================================ */

const SHEET_CSV_URL =
  // Spreadsheet Symphony Choir (dari link yang Anda bagikan)
SHEET_CSV_URL                            = "https://docs.google.com/spreadsheets/d/1ji_HbbLJfGGHNpKazpah5zchcp0sX37yOmHJgLHRU/gviz/tq?tqx=out:csv&sheet=DATA%20MABA%202026";
  // Catatan: pastikan spreadsheet di-BAGIKAN "Siapa pun yang memiliki link" → Viewer/Penayang.
  // Ganti &sheet=Sheet1 bila nama tab respons bukan "Sheet1".

const SHEET_FIELD_ORDER = ["tanggal", "nama", "nim", "prodi", "whatsapp", "jeniskelamin"];

/* ── parser CSV sederhana yang benar (mendukung nilai ber-tanda kutip) ── */
function csvToRows(csv) {
  const rows = [];
  let r = 0,
    c = 0,
    field = "",
    q = false;
  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (q) {
      if (ch === '"') {
        if (csv[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { q = true; continue; }
    if (ch === ",") { rows[r] = rows[r] || []; rows[r][c++] = field; field = ""; continue; }
    if (ch === "\n" || ch === "\r") {
      if (csv[i] === "\r" && csv[i + 1] === "\n") continue;
      rows[r] = rows[r] || [];
      if (field !== "" || (rows[r] && rows[r].length)) rows[r][c] = field;
      r++; c = 0; field = ""; continue;
    }
    field += ch;
  }
  if (field !== "") { rows[r] = rows[r] || []; rows[r][c] = field; }
  return rows.filter((x) => x.some((v) => v && v.trim() !== ""));
}

/* ── ambil data dari spreadsheet (pakai localStorage sbg cache & cadangan) ── */
function syncSheetToLocal() {
  if (!SHEET_CSV_URL) return;

  // baca isi lokal lama (jangan hilangin data yg sudah ada)
  let existing = [];
  try { existing = JSON.parse(localStorage.getItem("padus_pendaftar")) || []; } catch (e) { existing = []; }

  fetch(SHEET_CSV_URL, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then((csv) => {
      const rows = csvToRows(csv);                      // baris spreadsheet
      if (rows.length < 1) throw new Error("spreadsheet kosong");
      const header = rows[0].map((h) => h.trim().toLowerCase()); // cari posisi kolom

      // Google Form menyimpan judul PERTANYAAN sebagai header kolom
      // (mis. "Nama Lengkap", "Program Studi") → petakan dengan alias:
      const FIELD_ALIASES = {
        tanggal:     ["timestamp", "tanggal", "waktu", "date", "date created", "waktu pengisian"],
        nama:        ["nama", "nama lengkap", "full name", "name", "nama peserta"],
        nim:         ["nim", "npm", "nim / npm"],
        prodi:       ["prodi", "program studi", "program studi", "jurusan", "departemen", "study program"],
        whatsapp:    ["whatsapp", "nomor whatsapp", "no. whatsapp", "no whatsapp", "wa", "nomor wa", "phone", "telepon"],
        jeniskelamin:["jenis kelamin", "jeniskelamin", "jk", "gender", "jenis kelamin (l/p)"],
      };
      let idx = {};
      SHEET_FIELD_ORDER.forEach((k) => {
        idx[k] = -1;
        const aliases = FIELD_ALIASES[k] || [k];
        outer:
        for (const a of aliases) {
          for (let i = 0; i < header.length; i++) {
            if (header[i] === a || header[i].replace(/[^a-z0-9]+/g, "") === a.replace(/[^a-z0-9]+/g, "")) {
              idx[k] = i;
              break outer;
            }
          }
        }
      });

      const seen = new Set(existing.map((d) => (d.nama || "") + "|" + (d.whatsapp || "")));
      let added = 0;
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        const v = (k) => {
          const i2 = idx[k];
          return i2 >= 0 && i2 < r.length ? r[i2].trim() : "";
        };
        const nama = v("nama"),
          whatsapp = v("whatsapp");
        if (!nama || !whatsapp) continue;               // baris tidak lengkap → lewati
        const key = nama + "|" + whatsapp;
        if (seen.has(key)) continue;                    // duplikat → lewati
        seen.add(key);
        existing.push({
          id: "gf-" + Date.now() + "-" + added,
          nama,
          nim: v("nim"),
          prodi: v("prodi"),
          whatsapp,
          jeniskelamin: v("jeniskelamin"),
          tanggal: v("tanggal") || new Date().toISOString(),
        });
        added++;
      }

      if (added > 0) {
        localStorage.setItem("padus_pendaftar", JSON.stringify(existing));
        localStorage.setItem("padus_last_sync", new Date().toISOString());
        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(new CustomEvent("padus:sheet-sync", { detail: { added } })); // dashboard refresh
        }
      }
    })
    .catch((err) => {
      // offline/CORS/URL belum diisi → biarkan data lokal, jangan error di layar
      console.warn("[sheet-sync] tidak bisa tarik spreadsheet:", err.message);
    });
}

/* jalankan saat halaman dashboard terbuka + setiap 45 detik */
if (document && document.readyState !== "loading") syncSheetToLocal();
else document.addEventListener("DOMContentLoaded", syncSheetToLocal);
setInterval(syncSheetToLocal, 45000);
