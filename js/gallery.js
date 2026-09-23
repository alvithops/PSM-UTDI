/* ============================================================
   Galeri — lihat gambar & perbesar (lightbox)

   Cara pakai:
   1. Buka berkas index.html, cari bagian Galeri Kegiatan.
   2. Untuk SETIAP kartu, isi LINK gambar Anda pada atribut
      src dari <img class="gallery-photo" src="...">, contoh:
        <img class="gallery-photo"
             src="https://contoh.com/foto-latihan.jpg" ... />
   3. Halaman otomatis menampilkan foto dalam kartu.
   4. Klik tombol 👁️ (Lihat gambar) untuk melihat foto
      versi besar (lightbox overlay). Klik tempat kosong,
      tombol ✕, atau tekan Esc untuk menutup.
   ============================================================ */

function applyGalleryPhotos() {
  document.querySelectorAll(".gallery-item").forEach((item) => {
    const img = item.querySelector(".gallery-photo");
    const hasSrc = img && img.getAttribute("src") && img.getAttribute("src").trim() !== "";
    item.classList.toggle("has-img", !!hasSrc);

    /* placeholder saat src kosong: sembunyikan ikon rusak */
    const viewBtn = item.querySelector(".gallery-view");
    if (img) {
      img.onerror = () => {
        img.classList.add("photo-err");
      };
      img.onload = () => {
        img.classList.remove("photo-err");
      };
      if (!hasSrc) img.classList.add("photo-err");
    }
  });
}

function openLightbox(idx) {
  const item = document.querySelector(`.gallery-item[data-idx="${idx}"]`);
  const lb = document.getElementById("galleryLightbox");
  if (!lb || !item) return;

  const img = item.querySelector(".gallery-photo");
  const src = img ? img.getAttribute("src") || "" : "";
  const capEl = item.querySelector(".caption");
  const caption = capEl ? capEl.textContent : "";

  const lbImg = document.getElementById("lightboxImg");
  const lbCaption = document.getElementById("lightboxCaption");
  const lbEmoji = document.getElementById("lightboxEmoji");
  const lbEmojiSpan = item.querySelector(".gal-emoji");

  if (src.trim()) {
    lbImg.classList.remove("lb-ghost");
    lbImg.classList.add("lb-photo");
    lbImg.style.backgroundImage = `url("${src}")`;
    lbImg.style.backgroundSize = "cover";
    lbImg.style.backgroundPosition = "center";
    if (lbEmoji) lbEmoji.hidden = true;
  } else {
    lbImg.classList.remove("lb-photo");
    lbImg.classList.add("lb-ghost");
    lbImg.style.backgroundImage = "";
    if (lbEmoji) {
      lbEmoji.hidden = false;
      lbEmoji.textContent = lbEmojiSpan ? lbEmojiSpan.textContent : "🎤";
    }
  }

  if (lbCaption) lbCaption.textContent = caption;
  lb.classList.add("show");
  lb.setAttribute("aria-hidden", "false");
  document.body.classList.add("lb-open");
}

function closeLightbox() {
  const lb = document.getElementById("galleryLightbox");
  if (!lb) return;
  lb.classList.remove("show");
  lb.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lb-open");
}

document.addEventListener("DOMContentLoaded", () => {
  applyGalleryPhotos();

  document.querySelectorAll(".gallery-view").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = btn.closest(".gallery-item");
      const idx = Number(item.dataset.idx);
      openLightbox(idx);
    });
  });

  const lb = document.getElementById("galleryLightbox");
  if (lb) {
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.classList.contains("lb-close")) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});
