/* ============================================================
   APPS-SCRIPT_TEMPLATE.gs
   Symphonia Choir — "DATA MABA 2026" (Symphony)
   ------------------------------------------------------------
   CARA PAKAI (sekali saja, ±2 menit, di akun Google Anda):

   1) Buka  https://script.new   → hapus isi default → tempel
      SELURUH isi file ini → Klik   [Simpan]  (nama bebas,
      mis. "Padus Web Post").

   2) Klik  Deploy ▸ New deployment ▸ pilih ikon ⚙️ "Web app":
        - Execute as      :  Me
        - Who has access  :  Anyone
      Klik  [Deploy]  →  izinkan akses ("Review permissions"
      ▸ akun Anda ▸ Lanjutkan ▸ Izinkan).
      Salin URL Web App  (pola:  https://script.google.com/macros/s/AKfycb.../exec )

   3) Buka  padus-web/js/sheet-push.js  →  ganti GS_PUSH_URL:
        GS_PUSH_URL = "https://script.google.com/macros/s/AKfycb.../exec";
      (gunakan URL Web App hasil langkah 2; jangan lupa tutup petik).
      Selesai — setiap submit daftar.html kini menulis 1 baris
      baru ke spreadsheet tab "DATA MABA 2026". Dashboard
      auto-refresh lewat sheet-sync.js.

   ------------------------------------------------------------
   BILA INGIN UJI TANPA MENUNGGU FORM:
      Tempel di browser jendela Incognito:
      .../exec?nama=LAKUKAN_APEX&nim=1234567&prodi=TEKNIK_INFORMATIKA&whatsapp=081234567890&jeniskelamin=L
   ============================================================ */

/* ── 1) SPREADSHEET & TAB TUJUAN ─────────────────────────── */
var SHEET_ID = "1ji_HbbLJfGGHNpKazpah5zchcp0sX37yOmHJgLHRU"; // spreadsheet Symphony (link Anda)
var TAB      = "DATA MABA 2026";                             // nama tab / sheet di spreadsheet

/* ── 2) HANDLER POST  (dipanggil otomatis oleh fetch dari daftar.html) ── */
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); }
      catch (x) { body = parseQuery(e.postData.contents); }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var ss   = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
    var row  = [
      new Date().toISOString(),   // Waktu submit (UTC)
      body.nama         || "",
      body.nim          || "",
      body.prodi        || "",
      body.whatsapp     || "",
      body.jeniskelamin || ""
    ];

    // Baris pertama === header (tulis sekali, jangan ditimpa)
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, row.length)
        .setValues([["Waktu Submit", "Nama Lengkap", "NIM", "Program Studi", "Nomor WhatsApp", "Jenis Kelamin"]]);
    }

    sh.appendRow(row);

    return json({ ok: true, row: sh.getLastRow() });

  } catch (err) {
    return json({ ok: false, err: String(err), stack: err && err.stack || "" });
  }
}

/* ── 3) HANDLER GET — buat cek cepat URL jalan (opsional) ── */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.nama) {
    // Mode uji: tulis langsung satu baris (tanpa perlu form)
    e.postData = { contents: JSON.stringify({
      nama: p.nama, nim: p.nim || "", prodi: p.prodi || "",
      whatsapp: p.whatsapp || "", jeniskelamin: p.jeniskelamin || ""
    }) };
    return doPost(e);
  }
  return json({ ok: true, msg: "Apps Script Symphonia aktif — siap terima POST." });
}

/* ── helper ── */
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseQuery(qs) {
  var o = {};
  String(qs).split("&").forEach(function (pair) {
    var i = pair.indexOf("=");
    if (i < 0) return;
    var k = decodeURIComponent(pair.slice(0, i)).trim();
    var v = decodeURIComponent(pair.slice(i + 1)).trim();
    if (k) o[k] = v;
  });
  return o;
}
