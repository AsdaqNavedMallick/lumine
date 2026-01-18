console.log("🔥 JS loaded");

/* ======================
   THEMES
====================== */
const THEMES = {
  Birthday: {
    class: "theme-birthday",
    accent: "#ff7eb3",
    particles: ["#ffd369", "#ff9f1c", "#ff7eb3"],
    emoji: "🎂",
  },
  Festival: {
    class: "theme-festival",
    accent: "#ffd200",
    particles: ["#ffd200", "#f7971e", "#ff9f1c"],
    emoji: "🎉",
  },
  Achievement: {
    class: "theme-achievement",
    accent: "#38ef7d",
    particles: ["#38ef7d", "#11998e", "#4cc9f0"],
    emoji: "🏆",
  },
};

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
  const theme = THEMES[type];
  if (!theme) return;

  Object.values(THEMES).forEach((t) => document.body.classList.remove(t.class));

  document.body.classList.add(theme.class);
  document.documentElement.style.setProperty("--accent", theme.accent);
  window.currentParticleColors = theme.particles;
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

    document.getElementById("resultName").innerText =
      (THEMES[type]?.emoji || "✨") + " " + name;
    document.getElementById("resultMessage").innerText = msg;

    show("result");
    document.getElementById("copyBtn").style.display = "none";

    autoLoaded = true;
  }

  if (!autoLoaded) {
    show("home");
  }

  /* ======================
     EVENT LISTENERS
  ====================== */

  document.getElementById("startBtn").addEventListener("click", () => {
    show("celebrations");
  });

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedType = card.dataset.type;
      applyTheme(selectedType);
      show("personalize");
      document.getElementById("typeTitle").innerText =
        selectedType + " Celebration";
    });
  });

  document.getElementById("generateBtn").addEventListener("click", () => {
    const name = document.getElementById("nameInput").value.trim();
    const msg = document.getElementById("messageInput").value.trim();

    if (!name || !msg) {
      alert("Please complete both fields");
      return;
    }

    if (!selectedType) {
      selectedType = "Birthday";
      applyTheme(selectedType);
    }

    const theme = THEMES[selectedType];

    const params = new URLSearchParams({
      type: selectedType,
      name,
      msg,
    });
    window.history.pushState({}, "", "?" + params.toString());

    document.getElementById("resultName").innerText =
      (theme.emoji || "✨") + " " + name;
    document.getElementById("resultMessage").innerText = msg;

    document.getElementById("copyBtn").style.display = "inline-block";
    show("result");
  });

  document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Link copied ✨"));
  });

  /* ======================
     CANVAS
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

      const palette = window.currentParticleColors || [
        "#ffd369",
        "#ff9f1c",
        "#c77dff",
        "#4cc9f0",
      ];

      this.color = palette[Math.floor(Math.random() * palette.length)];
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
