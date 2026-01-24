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
  document.documentElement.style.setProperty(
    "--card-glow",
    theme.accent + "80",
  );
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
      document
        .querySelectorAll(".card")
        .forEach((c) => c.classList.remove("selected"));

      card.classList.add("selected");

      selectedType = card.dataset.type;
      applyTheme(selectedType);

      setTimeout(() => {
        show("personalize");
        document.getElementById("typeTitle").innerText =
          selectedType + " Celebration";
      }, 180); // lets animation play
    });
  });

  let burstParticles = [];

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

    // 🎉 Celebration burst
    setTimeout(() => {
      burst(canvas.width / 2, canvas.height / 2, 120);
    }, 150);
  });

  document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Link copied ✨"));
  });

  /* ======================
     CANVAS
  ====================== */

  // canvas setup
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Particle class
  class Particle {
    constructor(isBurst = false) {
      this.isBurst = isBurst;
      this.reset();
    }

    reset() {
      if (this.isBurst) return;

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
      this.x += this.vx;
      this.y += this.vy;
      this.life--;

      // gravity for burst
      if (this.isBurst) {
        this.vy += 0.06;
      }

      // ambient reset
      if (!this.isBurst && this.life <= 0) {
        this.reset();
      }
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

  // particle storage
  const particles = Array.from({ length: 70 }, () => new Particle());

  // ✅ burst()
  function burst(x, y, count = 120) {
    for (let i = 0; i < count; i++) {
      // 🎨 pick base theme colors
      const baseColors = window.currentParticleColors || [
        "#ffd369",
        "#ff9f1c",
        "#c77dff",
        "#4cc9f0",
      ];

      const base = baseColors[Math.floor(Math.random() * baseColors.length)];

      // ✨ mix with white so it contrasts with background
      const color = `color-mix(in srgb, ${base} 70%, white)`;

      // 💥 push particle
      burstParticles.push({
        x,
        y,
        vx: Math.cos(Math.random() * Math.PI * 2) * (Math.random() * 4 + 2),
        vy: Math.sin(Math.random() * Math.PI * 2) * (Math.random() * 4 + 2),
        life: Math.random() * 60 + 40,
        color,
      });
    }
  }
  // ambient particles
  let ambientParticles = [];
  // ambient particles loop
  function createAmbientParticle() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.6 - 0.2,
      life: Math.random() * 400 + 200,
      size: Math.random() * 2 + 1,
      color: (window.currentParticleColors || [
        "#ffd369",
        "#ff9f1c",
        "#c77dff",
        "#4cc9f0",
      ])[Math.floor(Math.random() * 4)],
    };
  }
  ambientParticles = Array.from({ length: 50 }, createAmbientParticle);

  // animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🌊 Ambient particles
    ambientParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.y < -20 || p.life <= 0) {
        Object.assign(p, createAmbientParticle());
      }
    });

    // 💥 Burst particles
    burstParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life--;

      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    });

    burstParticles = burstParticles.filter((p) => p.life > 0);

    requestAnimationFrame(animate);
  }
  animate();
});
