/*
 * quality.js - small, testable helpers inspired by the Software Testing lecture.
 *
 *  - boundaryValues()      Boundary Value Analysis: boundary, just inside, just outside
 *  - classify()            Equivalence-class partitioning for a numeric range
 *  - checkPageIntegrity()  Static analysis of this very page (nav links, headings, ids...)
 *  - runPageLoadChecks()   The unique function that runs when the page loads and shows the report
 *
 * Works in the browser (exposes window.SiteQuality) and in Node/Jest (module.exports).
 */
(function (root) {
  "use strict";

  function assertInteger(value, name) {
    if (!Number.isInteger(value)) {
      throw new TypeError(name + " must be an integer");
    }
  }

  /** Returns the sorted, de-duplicated boundary test values for the range [min, max]. */
  function boundaryValues(min, max) {
    assertInteger(min, "min");
    assertInteger(max, "max");
    if (min > max) {
      throw new RangeError("min must not be greater than max");
    }
    const values = [min - 1, min, min + 1, max - 1, max, max + 2];
    return Array.from(new Set(values)).sort(function (a, b) {
      return a - b;
    });
  }

  /** Equivalence class of a value for the valid range [min, max]: "below", "valid" or "above". */
  function classify(value, min, max) {
    assertInteger(value, "value");
    assertInteger(min, "min");
    assertInteger(max, "max");
    if (value < min) {
      return "below";
    }
    if (value > max) {
      return "above";
    }
    return "valid";
  }

  /** Runs integrity checks on a document and returns { results, passed, total, ok }. */
  function checkPageIntegrity(doc) {
    const results = [];

    function add(name, passed, detail) {
      results.push({ name: name, passed: passed, detail: passed ? "" : detail || "" });
    }

    add("Page has a title", (doc.title || "").trim().length > 0);
    add("Language attribute is set", Boolean(doc.documentElement.getAttribute("lang")), "missing lang");
    add("Exactly one h1 heading", doc.querySelectorAll("h1").length === 1, "found " + doc.querySelectorAll("h1").length);

    const brokenLinks = Array.from(doc.querySelectorAll("nav a[href^='#']"))
      .map(function (a) {
        return a.getAttribute("href");
      })
      .filter(function (href) {
        return href.length > 1 && !doc.getElementById(href.slice(1));
      });
    add("Every nav link points to a section", brokenLinks.length === 0, "broken: " + brokenLinks.join(", "));

    const ids = Array.from(doc.querySelectorAll("[id]")).map(function (el) {
      return el.id;
    });
    const duplicates = ids.filter(function (id, i) {
      return ids.indexOf(id) !== i;
    });
    add("No duplicate ids", duplicates.length === 0, "duplicates: " + duplicates.join(", "));

    const untitled = Array.from(doc.querySelectorAll("main section[id]")).filter(function (section) {
      return !section.querySelector("h2");
    });
    add("Every section has a heading", untitled.length === 0, untitled.length + " without h2");

    const noAlt = doc.querySelectorAll("img:not([alt])").length;
    add("All images have alt text", noAlt === 0, noAlt + " missing");

    const passed = results.filter(function (r) {
      return r.passed;
    }).length;
    return { results: results, passed: passed, total: results.length, ok: passed === results.length };
  }

  /** Writes a report into #pageCheckList / #pageCheckSummary. Returns false if they are absent. */
  function renderReport(doc, report) {
    const list = doc.getElementById("pageCheckList");
    const summary = doc.getElementById("pageCheckSummary");
    if (!list || !summary) {
      return false;
    }

    list.textContent = "";
    report.results.forEach(function (r) {
      const li = doc.createElement("li");
      li.className = r.passed ? "pass" : "fail";
      li.textContent = (r.passed ? "PASS  " : "FAIL  ") + r.name + (r.detail ? " (" + r.detail + ")" : "");
      list.appendChild(li);
    });

    summary.textContent = report.passed + " / " + report.total + " checks passed";
    summary.className = report.ok ? "ok" : "bad";
    return true;
  }

  /** The function that runs when the page is loaded: check the page and show the result. */
  function runPageLoadChecks(doc) {
    const report = checkPageIntegrity(doc);
    renderReport(doc, report);
    return report;
  }

  const api = {
    boundaryValues: boundaryValues,
    classify: classify,
    checkPageIntegrity: checkPageIntegrity,
    renderReport: renderReport,
    runPageLoadChecks: runPageLoadChecks
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.SiteQuality = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
