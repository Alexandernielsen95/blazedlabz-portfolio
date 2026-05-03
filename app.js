/* Blazed Labz — Portfolio. Vanilla JS. */
(() => {
  "use strict";

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const stored = localStorage.getItem("bl-theme");
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);
  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("bl-theme", next);
  });

  /* ---------- Sticky nav: shrink on scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav?.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Nav active state via scroll spy ---------- */
  const navLinks = document.querySelectorAll(".nav__links a");
  const sections = ["work", "about", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            navLinks.forEach((a) =>
              a.classList.toggle("is-active", a.dataset.nav === id)
            );
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Two-stage row disclosure ----------
     Stage 0 — collapsed (head only)
     Stage 1 — preview open (cover + meta column)   class .is-preview
     Stage 2 — full case study below                 class .is-case (always also has preview visible)
     Headline click toggles 0 ↔ 1 (and from 2, collapses fully back to 0).
     "View case study" button toggles 1 ↔ 2.
  --------------------------------------------------- */
  const rows = document.querySelectorAll(".row");

  rows.forEach((row) => {
    const head = row.querySelector(".row__head");
    const caseToggle = row.querySelector("[data-case-toggle]");
    const preview = row.querySelector(".preview");

    head?.addEventListener("click", () => {
      const isOpen = row.classList.contains("is-preview") || row.classList.contains("is-case");
      if (isOpen) {
        row.classList.remove("is-preview", "is-case");
        head.setAttribute("aria-expanded", "false");
        if (caseToggle) caseToggle.textContent = "View case study →";
      } else {
        row.classList.add("is-preview");
        head.setAttribute("aria-expanded", "true");
      }
    });

    caseToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      const wasCase = row.classList.contains("is-case");
      if (wasCase) {
        row.classList.remove("is-case");
        caseToggle.textContent = "View case study →";
      } else {
        row.classList.add("is-case");
        caseToggle.textContent = "Close case study ✕";
        // Smooth-scroll the case study into view, after the open animation
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const caseEl = row.querySelector(".case");
        setTimeout(() => {
          if (!caseEl) return;
          const top = window.scrollY + caseEl.getBoundingClientRect().top - 100;
          window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
        }, reduced ? 0 : 380);
      }
    });
  });

  /* ---------- Reveal rows on scroll ----------
     Rows are visible by default in CSS. The IntersectionObserver
     only adds `.is-entering` to rows that scroll INTO view from
     below the initial viewport — replaying the entrance as
     enhancement. Above-fold rows skip the animation, so no scroll
     event or observer fire is required for them to render.
     No-JS / no-IO environments see all rows immediately.
  --------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-entering");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    rows.forEach((r) => {
      if (r.getBoundingClientRect().top >= window.innerHeight) {
        reveal.observe(r);
      }
    });
  }

  /* ---------- Contact form → Formspree (Ajax) ----------
     POSTs FormData to the form's action with Accept: application/json so the
     user stays on the page. Honeypot (_gotcha) filters bots server-side.
  --------------------------------------------------- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  const submitBtn = form?.querySelector('button[type="submit"]');
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const msg = (data.get("message") || "").toString().trim();

    if (!name || !email || !msg) {
      if (note) note.textContent = "✱ fill all fields";
      return;
    }

    const originalBtnText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    if (note) note.textContent = "✱ sending…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        if (note) note.textContent = "✱ sent · talk soon";
        form.reset();
      } else {
        if (note) note.textContent = "✱ couldn't send — try again or email directly";
      }
    } catch {
      if (note) note.textContent = "✱ couldn't send — try again or email directly";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });

  /* ---------- Date in nav (DK · DD.MM.YY) ---------- */
  const dateEl = document.getElementById("nav-date");
  if (dateEl) {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    dateEl.textContent = `DK · ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
  }
})();
