const fs = require("fs");
const path = require("path");
const SiteQuality = require("../js/quality.js");

const { boundaryValues, classify, checkPageIntegrity, runPageLoadChecks } = SiteQuality;

describe("boundaryValues (boundary value analysis)", () => {
  test("returns boundary, just inside and just outside values", () => {
    // GIVEN a valid range of 18 to 60
    // WHEN we ask for its boundary values
    // THEN we get the values around both boundaries
    expect(boundaryValues(18, 60)).toEqual([17, 18, 19, 59, 60, 61]);
  });

  test("works with negative ranges", () => {
    expect(boundaryValues(-5, 5)).toEqual([-6, -5, -4, 4, 5, 6]);
  });

  test("removes duplicates for very small ranges", () => {
    expect(boundaryValues(5, 5)).toEqual([4, 5, 6]);
    expect(boundaryValues(5, 6)).toEqual([4, 5, 6, 7]);
  });

  test("rejects a minimum greater than the maximum", () => {
    expect(() => boundaryValues(10, 1)).toThrow(RangeError);
  });

  test("rejects non-integer input", () => {
    expect(() => boundaryValues(1.5, 3)).toThrow(TypeError);
  });
});

describe("classify (equivalence classes)", () => {
  test("values inside the range are valid", () => {
    expect(classify(18, 18, 60)).toBe("valid");
    expect(classify(40, 18, 60)).toBe("valid");
    expect(classify(60, 18, 60)).toBe("valid");
  });

  test("values just outside the range are rejected", () => {
    expect(classify(17, 18, 60)).toBe("below");
    expect(classify(61, 18, 60)).toBe("above");
  });
});

describe("page integrity checks", () => {
  const GOOD_PAGE =
    "<nav><a href=\"#a\">A</a></nav>" +
    "<main id=\"top\"><h1>Title</h1><section id=\"a\"><h2>A</h2></section></main>" +
    "<ul id=\"pageCheckList\"></ul><p id=\"pageCheckSummary\"></p>";

  function findResult(report, name) {
    return report.results.find((r) => r.name === name);
  }

  beforeEach(() => {
    document.documentElement.setAttribute("lang", "en");
    document.title = "Test page";
    document.body.innerHTML = GOOD_PAGE;
  });

  test("a well-formed page passes every check", () => {
    const report = checkPageIntegrity(document);
    expect(report.ok).toBe(true);
    expect(report.passed).toBe(report.total);
  });

  test("detects a nav link that points to a missing section", () => {
    document.querySelector("nav").innerHTML = "<a href=\"#a\">A</a><a href=\"#missing\">Oops</a>";
    const report = checkPageIntegrity(document);
    expect(report.ok).toBe(false);
    expect(findResult(report, "Every nav link points to a section").passed).toBe(false);
  });

  test("detects duplicate ids and extra h1 headings", () => {
    document.querySelector("main").innerHTML += "<h1>Second</h1><div id=\"a\"></div>";
    const report = checkPageIntegrity(document);
    expect(findResult(report, "No duplicate ids").passed).toBe(false);
    expect(findResult(report, "Exactly one h1 heading").passed).toBe(false);
  });

  test("runPageLoadChecks renders the report into the page", () => {
    const report = runPageLoadChecks(document);
    const summary = document.getElementById("pageCheckSummary");
    expect(summary.textContent).toBe(report.passed + " / " + report.total + " checks passed");
    expect(document.querySelectorAll("#pageCheckList li")).toHaveLength(report.total);
  });

  test("runPageLoadChecks does not crash when the report elements are missing", () => {
    document.body.innerHTML = "<nav></nav><main id=\"top\"><h1>Only</h1></main>";
    expect(() => runPageLoadChecks(document)).not.toThrow();
  });
});

describe("the real index.html", () => {
  test("passes every page integrity check", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const report = checkPageIntegrity(parsed);
    const failed = report.results.filter((r) => !r.passed).map((r) => r.name + " " + r.detail);
    expect(failed).toEqual([]);
  });
});
