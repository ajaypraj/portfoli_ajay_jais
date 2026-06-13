/* ============================================================
    AJAY JAISWAR — PORTFOLIO SCRIPT
    Handles: navigation, scroll reveal, skill bars, counters,
                active link highlighting, back-to-top, EmailJS form send
============================================================ */

(function () {
    "use strict";

    /* --------------------------------------------------------
       DOM REFERENCES
    -------------------------------------------------------- */
    const navbar = document.getElementById("navbar");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");
    const backToTop = document.getElementById("backToTop");
    const sections = document.querySelectorAll("main section[id]");
    const revealEls = document.querySelectorAll(".reveal");
    const skillFills = document.querySelectorAll(".skill-fill");
    const counters = document.querySelectorAll(".stat-number");
    const yearSpan = document.getElementById("year");
     const contactForm = document.getElementById("contact-form");

     /* --------------------------------------------------------
         EmailJS CONFIG
     -------------------------------------------------------- */
    const EMAILJS_PUBLIC_KEY = "1nNtKxx_fDPJnmsWH";
    const EMAILJS_SERVICE_ID = "service_coh4i9p";
    const EMAILJS_TEMPLATE_ID = "template_6vsmgf9";
     const FALLBACK_CONTACT_EMAIL = "jaiswarajaym@gmail.com";

     let emailJsReady = false;

    /* --------------------------------------------------------
       1. SET CURRENT YEAR IN FOOTER
    -------------------------------------------------------- */
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    /* --------------------------------------------------------
       2. STICKY NAVBAR + BACK-TO-TOP ON SCROLL
    -------------------------------------------------------- */
    function handleScroll() {
        const scrolled = window.scrollY > 40;
        navbar.classList.toggle("scrolled", scrolled);
        backToTop.classList.toggle("show", window.scrollY > 400);
        highlightActiveLink();
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    /* --------------------------------------------------------
       3. MOBILE NAV TOGGLE
    -------------------------------------------------------- */
    function closeMenu() {
        navMenu.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
    }

    navToggle.addEventListener("click", function () {
        const isOpen = navMenu.classList.toggle("open");
        navToggle.classList.toggle("open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when a link is clicked (mobile)
    navLinks.forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    // Close menu on Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
        if (
            navMenu.classList.contains("open") &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)
        ) {
            closeMenu();
        }
    });

    /* --------------------------------------------------------
       4. ACTIVE NAV LINK HIGHLIGHTING (scroll spy)
    -------------------------------------------------------- */
    function highlightActiveLink() {
        const scrollPos = window.scrollY + 120;
        let currentId = "";

        sections.forEach(function (section) {
            if (
                scrollPos >= section.offsetTop &&
                scrollPos < section.offsetTop + section.offsetHeight
            ) {
                currentId = section.getAttribute("id");
            }
        });

        navLinks.forEach(function (link) {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + currentId
            );
        });
    }

    /* --------------------------------------------------------
       5. BACK TO TOP CLICK
    -------------------------------------------------------- */
    backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* --------------------------------------------------------
       6. SCROLL REVEAL + SKILL BARS + COUNTERS
          (IntersectionObserver for performance)
    -------------------------------------------------------- */
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");

                        // Animate skill bars inside this element
                        animateSkills(entry.target);
                        // Animate counters inside this element
                        animateCounters(entry.target);

                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
        );

        revealEls.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback: show everything immediately
        revealEls.forEach(function (el) {
            el.classList.add("visible");
        });
        skillFills.forEach(function (fill) {
            fill.style.width = fill.dataset.progress + "%";
        });
        counters.forEach(function (c) {
            c.textContent = c.dataset.count;
        });
    }

    /* Fill any skill bars contained within the revealed element */
    function animateSkills(scope) {
        const fills = scope.querySelectorAll
            ? scope.querySelectorAll(".skill-fill")
            : [];
        fills.forEach(function (fill) {
            fill.style.width = fill.dataset.progress + "%";
        });
        // Also handle the case where the .reveal element IS the skill item
        if (scope.classList && scope.classList.contains("skill-item")) {
            const innerFill = scope.querySelector(".skill-fill");
            if (innerFill) innerFill.style.width = innerFill.dataset.progress + "%";
        }
    }

    /* Count-up animation for stat numbers */
    function animateCounters(scope) {
        const items = scope.querySelectorAll
            ? scope.querySelectorAll(".stat-number")
            : [];
        items.forEach(function (counter) {
            const target = parseInt(counter.dataset.count, 10) || 0;
            const duration = 1500;
            const startTime = performance.now();

            function update(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                // easeOutCubic
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.floor(eased * target);
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(update);
        });
    }

    function hasEmailJsConfig() {
        return Boolean(
            EMAILJS_PUBLIC_KEY &&
                EMAILJS_PUBLIC_KEY.trim() &&
                EMAILJS_SERVICE_ID &&
                EMAILJS_SERVICE_ID.trim() &&
                EMAILJS_TEMPLATE_ID &&
                EMAILJS_TEMPLATE_ID.trim()
        );
    }

    function getEmailJsErrorMessage(err) {
        if (!err) return "";
        if (typeof err === "string") return err;
        if (err.text) return String(err.text);
        if (err.message) return String(err.message);
        if (err.status) return "HTTP " + err.status;
        try {
            return JSON.stringify(err);
        } catch (_) {
            return "";
        }
    }

    function initEmailJs() {
        if (!window.emailjs) {
            console.error("EmailJS SDK not loaded.");
            return;
        }

        if (!hasEmailJsConfig()) {
            console.error("EmailJS config missing. Check public key, service ID, and template ID.");
            return;
        }

        try {
            window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            emailJsReady = true;
        } catch (err) {
            console.error("EmailJS init failed:", err);
        }
    }

    function showStatus(msg, type) {
        const el = document.getElementById("form-status");
        if (!el) return;

        el.textContent = msg;
        el.hidden = false;
        if (type === "success") {
            el.style.color = "#1e8449";
        } else {
            el.style.color = "#c0392b";
        }

        window.setTimeout(function () {
            el.hidden = true;
        }, 6000);
    }

    /* --------------------------------------------------------
       7. CONTACT FORM SUBMIT (EmailJS)
    -------------------------------------------------------- */
    initEmailJs();

    if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = document.getElementById("submit-btn");
            const btnText = document.getElementById("btn-text");

            const nameEl = document.getElementById("from_name");
            const emailEl = document.getElementById("reply_to");
            const subjectEl = document.getElementById("subject");
            const messageEl = document.getElementById("message");

            const name = nameEl ? nameEl.value.trim() : "";
            const email = emailEl ? emailEl.value.trim() : "";
            const subject = subjectEl ? subjectEl.value.trim() : "";
            const message = messageEl ? messageEl.value.trim() : "";

            if (!name || !email || !subject || !message) {
                showStatus("Please fill in all fields.", "error");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showStatus("Please enter a valid email address.", "error");
                return;
            }

            if (!window.emailjs || !emailJsReady) {
                showStatus(
                    "Email service is not configured correctly. Please try again in a few minutes.",
                    "error"
                );
                return;
            }

            if (btn) btn.disabled = true;
            if (btnText) btnText.textContent = "Sending...";

            const templateParams = {
                from_name: name,
                reply_to: email,
                subject: subject,
                message: message,
                to_email: FALLBACK_CONTACT_EMAIL,
            };

            try {
                await window.emailjs.send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    templateParams,
                    { publicKey: EMAILJS_PUBLIC_KEY }
                );

                showStatus("Message sent successfully! I'll get back to you soon.", "success");
                contactForm.reset();
            } catch (err) {
                console.error("EmailJS error:", err);
                const detail = getEmailJsErrorMessage(err);
                showStatus(
                    "Failed to send. Please email me directly at " +
                        FALLBACK_CONTACT_EMAIL +
                        (detail ? " (" + detail + ")" : ""),
                    "error"
                );
            } finally {
                if (btn) btn.disabled = false;
                if (btnText) btnText.textContent = "Send Message";
            }
        });
    }

    // Initialise on load
    handleScroll();
})();
