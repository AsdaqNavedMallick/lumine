console.log("🔥 JS loaded");

/* ======================
   STATE
====================== */
let selectedType = "";

/* ======================
   HELPERS
====================== */
function hideAll() {
  document
    .querySelectorAll(".container")
    .forEach((el) => el.classList.add("hidden"));
}

function show(id) {
  hideAll();
  document.getElementById(id).classList.remove("hidden");
}

function applyTheme(type) {
  document.body.classList.remove(
    "theme-birthday",
    "theme-festival",
    "theme-achievement",
  );

  if (!type) return;

  const map = {
    Birthday: "theme-birthday",
    Festival: "theme-festival",
    Achievement: "theme-achievement",
  };

  const themeClass = map[type];
  if (themeClass) {
    document.body.classList.add(themeClass);
  }
}

/* ======================
   DOM READY
====================== */

document.addEventListener("DOMContentLoaded", () => {
  let autoLoaded = false;

  /* ======================
     AUTOLOAD FROM URL
  ====================== */
  const params = new URLSearchParams(window.location.search);

  if (params.has("name") && params.has("msg")) {
    const name = params.get("name");
    const msg = params.get("msg");
    const type = params.get("type") || "Birthday";
    applyTheme(type);

    document.getElementById("resultName").innerText = name;
    document.getElementById("resultMessage").innerText = msg;

    show("result");

    // viewer should not see copy button
    document.getElementById("copyBtn").style.display = "none";

    autoLoaded = true;
  }

  /* ======================
     NORMAL ENTRY (ONLY IF NOT AUTOLOADED)
  ====================== */
  if (!autoLoaded) {
    show("home");
  }

  // 👇 event listeners + canvas code continues below

  /* ======================
     EVENT LISTENERS
  ====================== */

  // Start button
  document.getElementById("startBtn").addEventListener("click", () => {
    console.log("➡️ Start clicked");
    show("celebrations");
  });

  // Celebration cards
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedType = card.dataset.type;
      applyTheme(selectedType);
      show("personalize");
      document.getElementById("typeTitle").innerText =
        selectedType + " Celebration";
    });
  });

  // Generate button
  document.getElementById("generateBtn").addEventListener("click", () => {
    const name = document.getElementById("nameInput").value.trim();
    const msg = document.getElementById("messageInput").value.trim();

    if (!name || !msg) {
      alert("Please complete both fields");
      return;
    }

    const params = new URLSearchParams({
      type: selectedType,
      name,
      msg,
    });

    window.history.pushState({}, "", "?" + params.toString());

    document.getElementById("resultName").innerText = name;
    document.getElementById("resultMessage").innerText = msg;
    show("result");
  });

  document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Link copied ✨"));
  });

  /* ======================
     CANVAS (UNCHANGED)
  ====================== */

  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 200;
      this.r = Math.random() * 2 + 1;
      this.vy = Math.random() * 0.4 + 0.1;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.life = Math.random() * 300 + 200;
      this.color = ["#ffd369", "#ff9f1c", "#c77dff", "#4cc9f0"][
        Math.floor(Math.random() * 4)
      ];
    }
    update() {
      this.y -= this.vy;
      this.x += this.vx;
      this.life--;
      if (this.y < -10 || this.life <= 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  const particles = Array.from({ length: 70 }, () => new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
});
