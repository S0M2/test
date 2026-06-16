document.addEventListener("DOMContentLoaded", () => {
  // 1. TEXTE MARQUEE DEFILANT REPARE (sans typo Ubiquiti)
  const items = [
    "Installation réseau",
    "Cisco",
    "Ubiquiti",
    "Tp-link",
    "Câblage Cat6A",
    "Wi-Fi 6 Enterprise",
    "Firewall & VPN",
    "VLAN & Sécurité",
    "Téléphonie",
  ];
  const track = document.getElementById("marquee-track");
  if (track) {
    // Doublement du tableau pour un défilement infini sans coupure
    [...items, ...items].forEach((t) => {
      const el = document.createElement("div");
      el.className = "marquee-item";
      el.innerHTML = `<span class="marquee-dot"></span>${t}`;
      track.appendChild(el);
    });
  }

  // 2. INTERACTIVITE AVANCEE SCHÉMA SVG (VLAN & Équipements)
  const svg = document.getElementById("interactive-topo");
  if (svg) {
    const lines = svg.querySelectorAll(".interactive-line");
    const badges = svg.querySelectorAll(".vlan-badge");
    const nodes = svg.querySelectorAll(".node-group, .endpoint-item");
    const steps = document.querySelectorAll(".step");

    // Fonction utilitaire de nettoyage d'état
    const resetTopology = () => {
      lines.forEach((l) => {
        l.classList.remove("vlan-dimmed", "vlan-highlight");
        l.style.stroke = "";
      });
      badges.forEach((b) => b.classList.remove("vlan-dimmed"));
      nodes.forEach((n) => n.classList.remove("vlan-dimmed"));
    };

    // Filtrage par VLAN (badges)
    badges.forEach((badge) => {
      const vlanId = badge.getAttribute("data-vlan-id");
      badge.addEventListener("mouseenter", () => {
        lines.forEach((line) => {
          const vlans = line.getAttribute("data-vlan").split(",");
          if (!vlans.includes(vlanId)) line.classList.add("vlan-dimmed");
          else {
            line.classList.add("vlan-highlight");
            if (vlanId === "30") line.style.stroke = "var(--green)";
            if (vlanId === "10") line.style.stroke = "var(--blue)";
          }
        });
        badges.forEach((b) => {
          if (b !== badge) b.classList.add("vlan-dimmed");
        });
      });
      badge.addEventListener("mouseleave", resetTopology);
    });

    // Liaison Étapes Texte HTML -> Éléments du SVG
    steps.forEach((step) => {
      const stepType = step.getAttribute("data-step");
      step.addEventListener("mouseenter", () => {
        steps.forEach((s) => s.classList.remove("active-step"));
        step.classList.add("active-step");

        lines.forEach((line) => {
          if (stepType === "all") return;
          if (stepType === "wan" && !line.id.includes("wan"))
            line.classList.add("vlan-dimmed");
          if (
            stepType === "fw" &&
            !line.id.includes("fw") &&
            !line.id.includes("wan")
          )
            line.classList.add("vlan-dimmed");
          if (
            stepType === "sw" &&
            !line.id.includes("sw") &&
            !line.id.includes("trunk")
          )
            line.classList.add("vlan-dimmed");
          if (
            stepType === "endpoints" &&
            !line.classList.contains("interactive-line")
          )
            line.classList.add("vlan-dimmed");
        });
      });
      step.addEventListener("mouseleave", () => {
        step.classList.remove("active-step");
        resetTopology();
      });
    });
  }

  // 3. FONDS DYNAMIQUE CANVAS INTERACTIF (Suivi de souris)
  const canvas = document.getElementById("network-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let mouse = { x: null, y: null, radius: 120 };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    window.addEventListener("mouseleave", () => {
      mouse.x = null;
      mouse.y = null;
    });

    const nodesList = [];
    for (let i = 0; i < 28; i++) {
      nodesList.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1,
        isGreen: Math.random() < 0.15,
      });
    }

    const animateCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodesList.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        // Interaction au passage de la souris (léger repoussement fluide)
        if (mouse.x !== null && mouse.y !== null) {
          let dx = n.x - mouse.x;
          let dy = n.y - mouse.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            let force = (mouse.radius - dist) / mouse.radius;
            n.x += (dx / dist) * force * 2;
            n.y += (dy / dist) * force * 2;
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.isGreen
          ? "rgba(45,184,90,0.4)"
          : "rgba(26,95,212,0.4)";
        ctx.fill();
      });

      // Dessin des mailles/liaisons physiques
      for (let i = 0; i < nodesList.length; i++) {
        for (let j = i + 1; j < nodesList.length; j++) {
          const dx = nodesList[i].x - nodesList[j].x;
          const dy = nodesList[i].y - nodesList[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodesList[i].x, nodesList[i].y);
            ctx.lineTo(nodesList[j].x, nodesList[j].y);
            ctx.strokeStyle = `rgba(26, 95, 212, ${(1 - dist / 140) * 0.12})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateCanvas);
    };
    animateCanvas();
  }

  // 4. SCROLL REVEAL OBSERVER
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
});
