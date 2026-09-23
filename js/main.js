/* ============================================================
   PADUS WEB — Shared config & helpers
   ============================================================ */

const PADUS_CONFIG = {
  DATA_KEY: "padus_pendaftar",
  SESSION_KEY: "padus_admin_session",
  SESSION_MAX_MS: 8 * 60 * 60 * 1000,
  CLEARED_KEY: "padus_cleared",
  BACKUP_KEY: "padus_backup",
  WA_GROUP_URL: "https://chat.whatsapp.com/HZYyYK3CXHS6A299RQhqe0?s=cl&p=i&mlu=4&ilr=4",
  PRODI: ["Teknik Informatika", "Teknik Komputer", "Sistem Informasi", "Manajemen Ritel", "Bisnis Digital"],
  EVENT_INFO: { name: "Symphony Choir 2026" }
};

function setSession() {
  sessionStorage.setItem(PADUS_CONFIG.SESSION_KEY, JSON.stringify({ t: Date.now() }));
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(PADUS_CONFIG.SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.t) return null;
    if (Date.now() - s.t > PADUS_CONFIG.SESSION_MAX_MS) {
      sessionStorage.removeItem(PADUS_CONFIG.SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getSession();
}

function clearSession() {
  sessionStorage.removeItem(PADUS_CONFIG.SESSION_KEY);
}

function writeDemoData() {
  const names = ["Ahmad Fauzi", "Siti Nurhaliza", "Budi Santoso", "Maya Anggraini", "Rizky Pratama", "Dewi Lestari", "Andi Saputra", "Putri Ramadhani", "Joko Susilo", "Intan Permata", "Rahmat Hidayat", "Laila Fitriani", "Dimas Ardiansyah", "Nadia Safitri", "Bagas Kurniawan", "Sarah Amelia", "Fajar Nugroho", "Rina Wulandari", "Gilang Ramadhan", "Tasya Kamila"];
  const genders = ["Laki-laki", "Perempuan"];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const data = names.map((n, i) => {
    const jk = genders[i % 2];
    return {
      id: "P-2026-" + String(1001 + i),
      nama: n,
      nim: String(21 + (i % 5)) + "0" + String(22000 + i * 137),
      prodi: PADUS_CONFIG.PRODI[i % PADUS_CONFIG.PRODI.length],
      whatsapp: "08" + String(1200000000 + i * 7712341).slice(0, 10),
      jeniskelamin: jk,
      tanggal: new Date(now - (names.length - 1 - i) * dayMs * (0.6 + (i % 3) * 0.35)).toISOString()
    };
  });
  localStorage.setItem(PADUS_CONFIG.DATA_KEY, JSON.stringify(data));
}

function seedData() {
  const list = getData();
  if (localStorage.getItem(PADUS_CONFIG.CLEARED_KEY) === "1") return;
  if (list.length > 0) return;
  writeDemoData();
}

function getData() {
  try {
    const raw = localStorage.getItem(PADUS_CONFIG.DATA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData(list) {
  localStorage.setItem(PADUS_CONFIG.DATA_KEY, JSON.stringify(list));
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function showToast(msg, type) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.className = "toast show " + (type === "ok" ? "ok" : type === "err" ? "err" : "");
  t.textContent = msg;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 3200);
}

function revealScroll() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

function initNav() {
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      links.classList.toggle("open");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        links.classList.remove("open");
      })
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  revealScroll();
});