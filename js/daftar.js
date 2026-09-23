/* ============================================================
   Daftar — pendaftaran pendataan peserta
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const prodiSel = document.getElementById("prodi");
  PADUS_CONFIG.PRODI.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    prodiSel.appendChild(opt);
  });

  const form = document.getElementById("formDaftar");
  const btn = document.getElementById("btnSubmit");

  function setError(input, on) {
    const field = input.closest(".field");
    if (!field) return;
    field.classList.toggle("error", on);
  }

  const validators = {
    nama: (v) => v.trim().length >= 3,
    nim: (v) => /^\d{8,15}$/.test(v.trim()),
    prodi: (v) => !!v,
    whatsapp: (v) => {
      const clean = v.replace(/[\s-]/g, "");
      return /^08\d{8,12}$/.test(clean);
    },
    jeniskelamin: (v) => !!v
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    const payload = {};

    form.querySelectorAll("input, select").forEach((input) => {
      const key = input.name;
      payload[key] = input.value;
      const valid = validators[key] ? validators[key](input.value) : true;
      setError(input, !valid);
      if (!valid) ok = false;
    });

    if (!ok) {
      showToast("Periksa kembali isian formulir.", "err");
      const firstErr = form.querySelector(".field.error");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    btn.disabled = true;
    btn.textContent = "Mengirim...";

    const data = getData();
    const record = {
      id: "P-" + new Date().getFullYear() + "-" + String(1000 + data.length + 1),
      nama: payload.nama.trim(),
      nim: payload.nim.trim(),
      prodi: payload.prodi,
      whatsapp: payload.whatsapp.replace(/[\s-]/g, ""),
      jeniskelamin: payload.jeniskelamin,
      tanggal: new Date().toISOString()
    };
    data.push(record);
    saveData(data);

    sessionStorage.setItem("padus_pendaftar_baru", JSON.stringify(record));

    setTimeout(() => {
      window.location.href = "sukses.html";
    }, 900);
  });

  // Revalidate on input
  form.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("blur", () => {
      if (validators[input.name]) {
        setError(input, !validators[input.name](input.value));
      }
    });
    input.addEventListener("input", () => {
      if (input.closest(".field.error") && validators[input.name]) {
        setError(input, !validators[input.name](input.value));
      }
    });
  });
});