/* ============================================================
   sheet-push.js — kirim data pendaftaran daftar.html
   ke Google Sheets (via Google Apps Script Web App).
   ------------------------------------------------------------
   SETUP SEKALI (±2 menit, di akun Google Anda):

   1) Apps Script (Web App) — persis template di
      APPS-SCRIPT_TEMPLATE.gs (root proyek).
        Buka  script.new  →  hapus isi default  →  tempel isi
        APPS-SCRIPT_TEMPLATE.gs  →  Simpan.
        Deploy ▸ New deployment ▸ ⚙️ "Web app":
            Execute as     : Me
            Who has access : Anyone
        Deploy → izinkan akses → salin URL Web App
        (pola: https://script.google.com/macros/s/AKfycb.../exec)

   2) URL itu SUDAH ditempel di GS_PUSH_URL bawah ini.
      Selesai — SETIAP submit daftar.html → 1 baris baru
      otomatis masuk spreadsheet tab "DATA MABA 2026".
      ============================================================ */

var GS_PUSH_URL = "https://script.google.com/macros/s/AKfycbwRLCYuPYEJU9MLs6yi-jYhG6Im5v49MYKaSk68RB9MZWj0cNjybS7KaCafW07Rk4iY/exec";

/**
 * kirim satu record pendaftar ke spreadsheet.
 * Dipanggil oleh daftar.js setelah validasi sukses.
 * Tidak pernah menggagalkan user: kalau offline/CORS/gagal,
 * cukup resolve false — data tetap aman di localStorage.
 */
window.padusPushToSheet = function (record) {
  if (!GS_PUSH_URL || !record) return Promise.resolve(false);

  return fetch(GS_PUSH_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(record)
  })
    .then(function () {
      console.log("[sheet-push] data dikirim ✓");
      return true;
    })
    .catch(function (err) {
      console.warn(
        "[sheet-push] gagal kirim (offline/CORS) — data tetap di localStorage:",
        err.message
      );
      return false;
    });
};
