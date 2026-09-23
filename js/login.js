/* ============================================================
   Login — autentikasi admin (aman, anti brute-force)
   - Kredensial disimpan sebagai hash SHA-256 (bukan teks polos)
   - Penguncian otomatis setelah beberapa percobaan gagal
   - Sesi dengan batas waktu (8 jam)
   - tanpa info kredensial di halaman/script
   ============================================================ */

const LOGIN_HASH = {
  usernameHash: "2c72bb45dac61d1bde99dc3be3dbea3cf701faab4f988d9569bac1fd2c91081f",
  passwordHash: "c7d3184b427ce82cbdc836d3971f615ca8b43bc76f0805e22ae30f606e9a7767"
};

const MAX_ATTEMPTS = 5;
const ATTEMPTS_KEY = "padus_login_attempts";

function getAttempts() {
  try {
    const a = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "null");
    return a && typeof a.count === "number" ? a : { count: 0, lockedUntil: 0 };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function saveAttempts(a) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(a));
}

function cooldownFor(failures) {
  return Math.min(300, 10 * Math.pow(2, failures - 1));
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const timingSafeEqual = (a, b) => a.length === b.length && a.split("").every((ch, i) => ch === b[i]);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  const alertBox = document.getElementById("authAlert");
  const lockMsg = document.getElementById("lockMsg");
  const loginBtn = document.getElementById("btnLogin");
  const userIn = document.getElementById("username");
  const passIn = document.getElementById("password");
  const lockables = [userIn, passIn, loginBtn];
  let timerId = null;

  if (!window.crypto || !crypto.subtle) {
    lockMsg.style.display = "block";
    lockMsg.textContent =
      "❌ Browser/konteks ini tidak mendukung keamanan (HTTPS/localhost diperlukan). Gunakan Chrome, Edge, atau Firefox melalui HTTPS.";
    form.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  if (isLoggedIn()) {
    window.location.href = "dashboard.html";
    return;
  }

  function setLocked(on) {
    lockables.forEach((el) => (el.disabled = on));
    loginBtn.textContent = on ? "🔒 Terkunci" : "Masuk →";
  }

  function applyLockUi() {
    const a = getAttempts();
    const remaining = a.lockedUntil - Date.now();
    if (remaining > 0) {
      setLocked(true);
      lockMsg.style.display = "block";
      tickCountdown(remaining);
    } else {
      if (a.count >= MAX_ATTEMPTS) saveAttempts({ count: 0, lockedUntil: 0 });
      setLocked(false);
      lockMsg.style.display = "none";
      lockMsg.textContent = "";
    }
  }

  function tickCountdown(remaining) {
    clearTimeout(timerId);
    if (remaining <= 0) {
      saveAttempts({ count: 0, lockedUntil: 0 });
      setLocked(false);
      lockMsg.style.display = "none";
      lockMsg.textContent = "";
      return;
    }
    const secs = Math.ceil(remaining / 1000);
    lockMsg.textContent = `🚫 Terlalu banyak percobaan. Coba lagi dalam ${secs} detik.`;
    lockMsg.classList.add("show");
    lockMsg.style.display = "block";
    timerId = setTimeout(() => tickCountdown(remaining - 1000), 1000);
  }

  function showError(msg) {
    alertBox.textContent = msg;
    alertBox.classList.add("show");
    clearTimeout(showError._timer);
    showError._timer = setTimeout(() => alertBox.classList.remove("show"), 3200);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let a = getAttempts();

    if (a.lockedUntil > Date.now()) {
      applyLockUi();
      return;
    }

    const u = userIn.value.trim();
    const p = passIn.value;

    if (!u || !p) {
      showError("⚠️ Username dan password wajib diisi.");
      return;
    }
    if (u.length > 50 || p.length > 64) {
      showError("⚠️ Input tidak valid.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Memeriksa...";

    // Jeda acak untuk memperlambat brute-force
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 350));

    const uHash = await sha256(u);
    const pHash = await sha256(p);
    const ok = timingSafeEqual(uHash, LOGIN_HASH.usernameHash) && timingSafeEqual(pHash, LOGIN_HASH.passwordHash);

    if (ok) {
      saveAttempts({ count: 0, lockedUntil: 0 });
      setSession();
      loginBtn.textContent = "Berhasil ✓";
      loginBtn.classList.add("activated");
      showToast("Login berhasil. Menuju dashboard...", "ok");
      setTimeout(() => (window.location.href = "dashboard.html"), 600);
      return;
    }

    a.count += 1;
    const lockSec = cooldownFor(a.count);
    a.lockedUntil = a.count >= MAX_ATTEMPTS ? Date.now() + lockSec * 1000 : 0;
    saveAttempts(a);

    const locked = a.count >= MAX_ATTEMPTS;
    showError(
      locked
        ? `🔒 Akun dikunci. Coba lagi dalam ${lockSec} detik.`
        : `⚠️ Username atau password salah. (Percobaan ${a.count}/${MAX_ATTEMPTS})`
    );
    loginBtn.disabled = false;
    loginBtn.textContent = "Masuk →";
    passIn.value = "";

    if (locked) applyLockUi();
  });

  applyLockUi();
});