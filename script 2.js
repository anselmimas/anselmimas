document.addEventListener("DOMContentLoaded", () => {
  initRevealSections();
  initAnimatedCounters();
  initHeroParallax();
  initLoopingCarousels();
  initCarouselLightbox();
  initContactFormValidation();
  initMobileNav();
});

function initRevealSections() {
  const revealables = document.querySelectorAll("[data-reveal]");
  if (!revealables.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = entry.target.dataset.delay || 0;
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );

  revealables.forEach((el) => observer.observe(el));
}

function initAnimatedCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.target || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const duration = parseInt(el.dataset.duration || "1400", 10);
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (target * eased).toFixed(decimals);
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (!el.dataset.played) {
            animate(el);
            el.dataset.played = "true";
          }
          obs.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => observer.observe(counter));
  } else {
    counters.forEach((counter) => animate(counter));
  }
}

function initHeroParallax() {
  const gallery = document.querySelector("[data-parallax]");
  if (!gallery) return;

  const photos = gallery.querySelectorAll(".hero-photo");
  if (!photos.length) return;

  const handleMove = (event) => {
    const rect = gallery.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    photos.forEach((photo, index) => {
      const depth = 1 + index * 0.08;
      const translateX = x * 10 * depth;
      const translateY = y * 10 * depth;
      const rotateX = -y * 8 * depth;
      const rotateY = x * 8 * depth;
      photo.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  };

  const reset = () => {
    photos.forEach((photo) => {
      photo.style.transform = "";
    });
  };

  gallery.addEventListener("pointermove", handleMove);
  gallery.addEventListener("pointerleave", reset);
  gallery.addEventListener("touchend", reset);
}

function initContactFormValidation() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+()\\s-]{6,}$/;

  const clearErrors = () => {
    form.querySelectorAll(".field-error").forEach((el) => el.remove());
    Array.from(form.elements).forEach((el) => el.classList?.remove("has-error"));
  };

  const showError = (fieldName, message) => {
    const field = form.elements[fieldName];
    if (!field) return;

    // Evita duplicados
    const next = field.nextElementSibling;
    if (next && next.classList?.contains("field-error")) next.remove();

    const bubble = document.createElement("div");
    bubble.className = "field-error";
    bubble.innerHTML = `<span class="icon">!</span><span class="text">${message}</span>`;
    field.insertAdjacentElement("afterend", bubble);
    field.classList.add("has-error");
    requestAnimationFrame(() => bubble.classList.add("visible"));
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const formData = new FormData(form);
    const name = (formData.get("name") || "").trim();
    const company = (formData.get("company") || "").trim();
    const email = (formData.get("email") || "").trim();
    const phone = (formData.get("phone") || "").trim();
    const service = (formData.get("service") || "").trim();
    const description = (formData.get("description") || "").trim();

    let hasError = false;

    if (!name) {
      showError("name", "Ingresá tu nombre completo.");
      hasError = true;
    }

    if (!company) {
      showError("company", "Indicá tu empresa.");
      hasError = true;
    }

    if (!emailPattern.test(email)) {
      showError("email", "El email debe tener @ y un dominio con punto.");
      hasError = true;
    }

    if (!phonePattern.test(phone)) {
      showError("phone", "Ingresá un teléfono válido.");
      hasError = true;
    }

    if (!service) {
      showError("service", "Elegí el tipo de stand.");
      hasError = true;
    }

    if (!description) {
      showError("description", "Describí qué buscás para tu stand.");
      hasError = true;
    }

    if (hasError) {
      const firstError = form.querySelector(".has-error");
      if (firstError) firstError.focus();
      return;
    }

    alert("¡Mensaje enviado correctamente!");
    form.reset();
    clearErrors();
  });

  Array.from(form.elements).forEach((field) => {
    field.addEventListener("input", () => {
      const error = field.nextElementSibling;
      if (error && error.classList?.contains("field-error")) {
        error.remove();
      }
      field.classList.remove("has-error");
    });
  });
}

function initMobileNav() {
  const toggles = Array.from(document.querySelectorAll(".nav-toggle"));
  if (!toggles.length) return;

  const body = document.body;
  const nav = document.querySelector("header nav");

  const closeNav = () => {
    body.classList.remove("nav-open");
    toggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  };

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
}

function initLoopingCarousels() {
  const tracks = document.querySelectorAll(
    ".collection-slider .slider-track, .logo-carousel .logo-track, .vertical-carousel .vertical-track"
  );
  if (!tracks.length) return;

  tracks.forEach((track) => {
    if (track.dataset.looped === "true") return;

    const items = Array.from(track.children);
    if (!items.length) return;

    // Duplica para tener buffer y loopear sin corte.
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      const img = clone.querySelector("img");
      if (img) {
        img.loading = "eager";
        img.decoding = "async";
      }
      track.appendChild(clone);
    });

    track.dataset.looped = "true";

    const axis = track.dataset.axis === "y" ? "y" : "x";
    const speed = track.classList.contains("logo-track") ? 40 : 32; // px por segundo
    let offset = 0;
    let paused = false;

    const recalc = () => ({
      halfLength: axis === "y" ? track.scrollHeight / 2 : track.scrollWidth / 2,
    });
    let { halfLength } = recalc();

    let rafId = null;
    const frame = (time) => {
      if (!frame.lastTime) frame.lastTime = time;
      const delta = (time - frame.lastTime) / 1000;
      frame.lastTime = time;

      if (!paused) {
        offset += speed * delta;
        if (offset >= halfLength) {
          offset -= halfLength;
        }
        if (axis === "y") {
          track.style.transform = `translateY(-${offset}px)`;
        } else {
          track.style.transform = `translateX(-${offset}px)`;
        }
      }
      rafId = requestAnimationFrame(frame);
    };

    // Pausa/resume en hover/touch.
    const pause = () => (paused = true);
    const play = () => (paused = false);
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", play);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("touchend", play);

    // Recalcular al resize para evitar saltos.
    const handleResize = () => {
      halfLength = recalc().halfLength;
      if (offset >= halfLength) offset = offset % halfLength;
      if (axis === "y") {
        track.style.transform = `translateY(-${offset}px)`;
      } else {
        track.style.transform = `translateX(-${offset}px)`;
      }
    };
    window.addEventListener("resize", handleResize);

    rafId = requestAnimationFrame(frame);
  });
}

function initCarouselLightbox() {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Cerrar imagen">&times;</button>
    <div class="lightbox-shell">
      <button class="lightbox-nav lightbox-prev" aria-label="Anterior">&#10094;</button>
      <div class="lightbox-content">
        <img class="lightbox-image" alt="" />
      </div>
      <button class="lightbox-nav lightbox-next" aria-label="Siguiente">&#10095;</button>
    </div>
  `;

  const closeBtn = overlay.querySelector(".lightbox-close");
  const prevBtn = overlay.querySelector(".lightbox-prev");
  const nextBtn = overlay.querySelector(".lightbox-next");
  const imgEl = overlay.querySelector(".lightbox-image");
  let images = [];
  let currentIndex = 0;
  let highlighted = null;

  const close = () => {
    overlay.classList.remove("is-open");
    imgEl.src = "";
    imgEl.alt = "";
    document.body.classList.remove("lightbox-open");
    images = [];
    currentIndex = 0;
    if (highlighted) {
      highlighted.classList.remove("carousel-highlight");
      highlighted = null;
    }
  };

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(1);
    if (e.key === "ArrowLeft") show(-1);
  });

  document.body.appendChild(overlay);

  const show = (direction) => {
    if (!images.length) return;
    currentIndex = (currentIndex + direction + images.length) % images.length;
    const { src, alt } = images[currentIndex];
    imgEl.src = src;
    imgEl.alt = alt || "";
  };

  const openWith = (list, index) => {
    images = list;
    currentIndex = index;
    const { src, alt } = images[currentIndex];
    imgEl.src = src;
    imgEl.alt = alt || "";
    overlay.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  };

  prevBtn.addEventListener("click", () => show(-1));
  nextBtn.addEventListener("click", () => show(1));

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const img =
      target.closest(".slider-item img") || target.closest(".logo-item img");
    if (!img) return;

    event.preventDefault();
    const track = img.closest(".slider-track, .logo-track");
    const allImgs = Array.from(track?.querySelectorAll("img") || []);
    if (!allImgs.length) return;

    const baseCount =
      track?.dataset.looped === "true" && allImgs.length > 1
        ? Math.max(1, Math.floor(allImgs.length / 2))
        : allImgs.length;

    const list = allImgs.slice(0, baseCount).map((el) => ({
      src: el.src,
      alt: el.alt || "",
    }));

    const clickedIndex = allImgs.indexOf(img);
    const index = clickedIndex > -1 ? clickedIndex % baseCount : 0;

    const marker = img.closest(".slider-item, .logo-item") || img;
    if (highlighted && highlighted !== marker) {
      highlighted.classList.remove("carousel-highlight");
    }
    marker.classList.add("carousel-highlight");
    highlighted = marker;

    openWith(list, index);
  });
}
