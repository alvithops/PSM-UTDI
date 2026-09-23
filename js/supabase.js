/* ============================================================
   PADUS Web — Supabase client config (static-friendly)
   ------------------------------------------------------------
   Nilai URL & anon key DIAMBIL LANGSUNG dari JWT yang Anda
   tempel (bukan tebakan). Aman untuk sisi klien:
   role=anon → hanya INSERT & SELECT via RLS, tidak ada hak
   update/hapus publik.
   ============================================================ */

(function (global) {
  "use strict";

  /* --- SUPABASE PADUS : jembatan database terpusat --- */
  var SUPABASE_PADUS = window.SUPABASE_PADUS || {};
  SUPABASE_PADUS.URL =
    "https://odymsmfzqsjsjohdthpl.supabase.co";
  SUPABASE_PADUS.ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keW1zbWZ6cXNqc2pvaGR0aHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNzQzMDcsImV4cCI6MjEwNTc1MDMwN30" +
    ".yGCdOYd50mOGmePGadCxzaxGT8M6s0F9MxLZfffK7Po";
  SUPABASE_PADUS.IS_CONFIGURED =
    SUPABASE_PADUS.URL.indexOf("supabase.co") > 0 &&
    SUPABASE_PADUS.ANON_KEY.length > 120;

  /* ------ PostgREST helper (fetch murni, tanpa library) ------ */
  function supabaseFetch(path, options) {
    var headers = {
      apikey: SUPABASE_PADUS.ANON_KEY,
      Authorization: "Bearer " + SUPABASE_PADUS.ANON_KEY,
      "Content-Type": "application/json",
    };
    if (options && options.body) headers.Prefer = "return=representation";
    return fetch(SUPABASE_PADUS.URL + "/rest/v1/" + "padus_pendaftar" + path, {
      method: (options && options.method) || "GET",
      headers: headers,
      body: options && options.body ? JSON.stringify(options.body) : undefined,
    });
  }

  /* ================== SISIPAN SUPABASE UNTUK PADUS =================
     1) simpanPendaftar(record)  → INSERT ke tabel padus_pendaftar
     2) ambilPendaftar()          → SELECT semua (dashboard)
     Semua fungsi promise + ada .catch di pemanggil (aman offline).
     =============================================================== */
  async function simpanPendaftar(record) {
    try {
      const r = await supabaseFetch("", {
        method: "POST",
        body: {
          nama: record.nama,
          nim: record.nim,
          prodi: record.prodi,
          whatsapp: record.whatsapp,
          jeniskelamin: record.jeniskelamin,
        },
      });
      if (!r.ok) {
        console.warn("Supabase simpan gagal:", r.status);
        return { ok: false };
      }
      return { ok: true };
    } catch (e) {
      console.warn("Supabase simpan error:", e.message);
      return { ok: false };
    }
  }

  async function ambilPendaftar() {
    try {
      const r = await supabaseFetch(
        "?select=id,nama,nim,prodi,whatsapp,jeniskelamin,created_at&order=created_at.desc"
      );
      if (!r.ok) return { ok: false };
      const rows = await r.json();
      return { ok: true, list: rows || [] };
    } catch (e) {
      return { ok: false };
    }
  }

  global.SUPABASE_PADUS = SUPABASE_PADUS;
  global.simpanPendaftar = simpanPendaftar;
  global.ambilPendaftar = ambilPendaftar;
})(window);
