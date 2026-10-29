(function () {
  "use strict";

  /* ---------- Tabs (participants, build types) ---------- */
  function initTabs() {
    const groups = document.querySelectorAll("[data-tabs]");

    groups.forEach(function (group, g) {
      const tabs = Array.from(group.querySelectorAll("[role='tab']"));
      const panels = Array.from(group.querySelectorAll("[role='tabpanel']"));

      function activate(index, focus) {
        tabs.forEach(function (tab, i) {
          const selected = i === index;
          tab.setAttribute("aria-selected", String(selected));
          tab.tabIndex = selected ? 0 : -1;
          panels[i].hidden = !selected;
          if (selected && focus) {
            tab.focus();
          }
        });
      }

      tabs.forEach(function (tab, i) {
        tab.id = "tab-" + g + "-" + i;
        panels[i].id = "panel-" + g + "-" + i;
        tab.setAttribute("aria-controls", panels[i].id);
        panels[i].setAttribute("aria-labelledby", tab.id);

        tab.addEventListener("click", function () {
          activate(i, false);
        });

        tab.addEventListener("keydown", function (event) {
          if (event.key === "ArrowRight") {
            activate((i + 1) % tabs.length, true);
          } else if (event.key === "ArrowLeft") {
            activate((i - 1 + tabs.length) % tabs.length, true);
          }
        });
      });

      activate(0, false);
    });
  }

  /* ---------- Naming model builder: PP.CC.RRR.VVV.TT.FF ---------- */
  function pad(value, length) {
    const digits = String(value).replace(/\D/g, "");
    return (digits === "" ? "0" : digits).padStart(length, "0").slice(-length);
  }

  function letters(value, length) {
    const clean = String(value).replace(/[^a-z0-9]/gi, "").toUpperCase();
    return clean.padEnd(length, "X").slice(0, length);
  }

  function initNameBuilder() {
    const out = document.getElementById("nameOut");
    const explain = document.getElementById("nameExplain");
    const copyBtn = document.getElementById("copyName");
    if (!out || !explain) {
      return;
    }

    const fields = ["fPP", "fCC", "fRRR", "fVVV", "fTT", "fFF"].map(function (id) {
      return document.getElementById(id);
    });

    function update() {
      const pp = letters(fields[0].value, 2);
      const cc = letters(fields[1].value, 2);
      const rrr = pad(fields[2].value, 3);
      const vvv = pad(fields[3].value, 3);
      const tt = fields[4].value;
      const ff = fields[5].value;

      out.textContent = [pp, cc, rrr, vvv, tt, ff].join(".");
      explain.textContent =
        "Product " + pp + ", country " + cc + ", release " + Number(rrr) +
        ", version " + Number(vvv) + ", type " + tt + ", format " + ff + ".";
    }

    fields.forEach(function (field) {
      field.addEventListener("input", update);
      field.addEventListener("change", update);
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (!navigator.clipboard) {
          return;
        }
        navigator.clipboard.writeText(out.textContent).then(function () {
          copyBtn.textContent = "Copied!";
          window.setTimeout(function () {
            copyBtn.textContent = "Copy";
          }, 1500);
        });
      });
    }

    update();
  }

  /* ---------- Quiz ---------- */
  const QUESTIONS = [
    {
      q: "Which two models make up the configuration management framework?",
      options: [
        "Waterfall model and Agile model",
        "Naming model and Storage and Access model",
        "Build model and Test model",
        "Policy model and Process model"
      ],
      answer: 1,
      why: "The framework is composed of the naming model and the storage and access model."
    },
    {
      q: "In the sample scheme PP.CC.RRR.VVV.TT.FF, what does CC stand for?",
      options: ["Change control", "Country code", "Component class", "Compile count"],
      answer: 1,
      why: "CC is the country code, used for translated, multi-country releases."
    },
    {
      q: "Why are artifacts promoted through a multilevel test process?",
      options: [
        "To make files smaller",
        "To delete old versions",
        "To lock tested code so it cannot be regressed",
        "To skip the system test"
      ],
      answer: 2,
      why: "Code tested at a level is locked and given no opportunity to regress, ending as the system-tested golden copy."
    },
    {
      q: "Why are complete builds of large systems often run at night?",
      options: [
        "They can take 6 or 7 hours or more",
        "Compilers only work after midnight",
        "Developers are not allowed to work during the day",
        "Linking is only possible at night"
      ],
      answer: 0,
      why: "A full build of large, complex software is lengthy, so it is scheduled as a nightly build."
    },
    {
      q: "Why must the final build target the users' run-time environment?",
      options: [
        "Users prefer smaller files",
        "Software that works on the developers' system may fail on the users' system",
        "It removes the need for testing",
        "It is required by the Git license"
      ],
      answer: 1,
      why: "Environment differences can make software that runs well for developers fail for users."
    },
    {
      q: "A form accepts ages 18 to 60. Which set follows boundary value analysis?",
      options: [
        "1, 30, 100",
        "17, 18, 19, 59, 60, 61",
        "18, 60 only",
        "Every number from 0 to 100"
      ],
      answer: 1,
      why: "Boundary value analysis tests each boundary, the value just inside it and the value just outside it."
    },
    {
      q: "What is the correct order of the TDD cycle?",
      options: [
        "Write code, write test, refactor",
        "Refactor, write test, write code",
        "Write a test, see it fail, make it pass, re-run all tests, refactor",
        "Write code, ship it, then write tests"
      ],
      answer: 2,
      why: "TDD writes the failing test first, then the code to pass it, then re-runs all tests and refactors."
    },
    {
      q: "Which statement best describes verification versus validation?",
      options: [
        "They mean exactly the same thing",
        "Verification checks conformance to specifications; validation checks the finished product meets users' requirements",
        "Verification is done by users; validation is done by compilers",
        "Verification only applies to hardware"
      ],
      answer: 1,
      why: "Verification checks conformance to requirements and specifications; validation checks the finished product meets the users' needs."
    }
  ];

  function initQuiz() {
    const root = document.getElementById("quizRoot");
    if (!root) {
      return;
    }

    let answered = 0;
    let score = 0;
    const scoreEl = document.createElement("p");
    scoreEl.className = "quiz-score";
    scoreEl.setAttribute("aria-live", "polite");

    QUESTIONS.forEach(function (item, qi) {
      const card = document.createElement("div");
      card.className = "card quiz-q";

      const title = document.createElement("h3");
      title.textContent = (qi + 1) + ". " + item.q;
      card.appendChild(title);

      const list = document.createElement("div");
      list.className = "quiz-options";
      const feedback = document.createElement("p");
      feedback.className = "quiz-feedback";

      const buttons = item.options.map(function (text, oi) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-option";
        btn.textContent = text;

        btn.addEventListener("click", function () {
          buttons.forEach(function (b) {
            b.disabled = true;
          });
          const correct = oi === item.answer;
          btn.classList.add(correct ? "correct" : "wrong");
          buttons[item.answer].classList.add("correct");
          feedback.textContent = (correct ? "Correct. " : "Not quite. ") + item.why;

          answered += 1;
          if (correct) {
            score += 1;
          }
          if (answered === QUESTIONS.length) {
            scoreEl.textContent = "Your score: " + score + " / " + QUESTIONS.length;
          }
        });

        list.appendChild(btn);
        return btn;
      });

      card.appendChild(list);
      card.appendChild(feedback);
      root.appendChild(card);
    });

    root.appendChild(scoreEl);
  }

  /* ---------- Boundary value analysis tool (uses js/quality.js) ---------- */
  function readNumber(input) {
    return input.value.trim() === "" ? NaN : Number(input.value);
  }

  function initBoundaryTool() {
    const minEl = document.getElementById("bvaMin");
    const maxEl = document.getElementById("bvaMax");
    const rows = document.getElementById("bvaRows");
    const msg = document.getElementById("bvaMsg");
    const quality = window.SiteQuality;
    if (!minEl || !maxEl || !rows || !msg || !quality) {
      return;
    }

    function update() {
      const min = readNumber(minEl);
      const max = readNumber(maxEl);
      rows.textContent = "";

      let values;
      try {
        values = quality.boundaryValues(min, max);
      } catch {
        msg.textContent = "Enter whole numbers where the minimum is not greater than the maximum.";
        return;
      }

      msg.textContent = values.length + " test cases for the valid range " + min + " to " + max + ".";
      values.forEach(function (value) {
        const kind = quality.classify(value, min, max);
        const tr = document.createElement("tr");
        tr.className = kind;

        const tdValue = document.createElement("td");
        tdValue.textContent = String(value);
        const tdExpected = document.createElement("td");
        tdExpected.textContent = kind === "valid" ? "Accepted" : "Rejected (" + kind + " range)";

        tr.appendChild(tdValue);
        tr.appendChild(tdExpected);
        rows.appendChild(tr);
      });
    }

    minEl.addEventListener("input", update);
    maxEl.addEventListener("input", update);
    update();
  }

  /* ---------- Page self-check: runs when the page has loaded ---------- */
  function initPageChecks() {
    window.addEventListener("load", function () {
      if (window.SiteQuality) {
        window.SiteQuality.runPageLoadChecks(document);
      }
    });
  }

  /* ---------- Build info written by the GitHub Actions workflow ---------- */
  function initBuildInfo() {
    const el = document.getElementById("buildInfo");
    if (!el) {
      return;
    }

    fetch("build-info.json", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("No build info");
        }
        return response.json();
      })
      .then(function (info) {
        el.textContent =
          "Commit " + info.commit + " \u00b7 run #" + info.run + " \u00b7 built " + info.builtAt;
      })
      .catch(function () {
        el.textContent = "Local preview (not built by GitHub Actions)";
      });
  }

  /* ---------- Navigation: mobile toggle, active link, reveal on scroll ---------- */
  function initNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const links = Array.from(nav.querySelectorAll("a"));
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach(function (section) {
      sectionObserver.observe(section);
    });

    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".card, .flow-step").forEach(function (el) {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  initTabs();
  initNameBuilder();
  initQuiz();
  initBoundaryTool();
  initPageChecks();
  initBuildInfo();
  initNav();
})();
