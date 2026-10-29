# SCM & Testing Study Site

A static site (HTML/CSS/JS) on **Software Configuration Management** and **Software Testing & QA**, based on the SEN02 class lectures.
It is **linted, tested and deployed** to GitHub Pages by a GitHub Actions workflow.

## Project structure

```
.
├── index.html
├── css/style.css
├── js/
│   ├── main.js               # UI behaviour (tabs, quiz, naming builder, boundary tool)
│   └── quality.js            # NEW: testable helpers + the page-load function
├── tests/quality.test.js     # NEW: Jest tests
├── eslint.config.mjs         # lint rules (missing semicolon = error)
├── package.json              # npm run lint / npm test
├── PROMPTS.md                # all LLM prompts used
└── .github/workflows/deploy.yml
```

## The unique page-load function

`runPageLoadChecks(document)` in `js/quality.js` runs when the page loads (`window.addEventListener("load", ...)` in `main.js`).
It performs a static-analysis style check of the page itself (title, `lang`, a single `h1`, every nav link has a matching section,
no duplicate ids, every section has a heading, images have alt text) and shows the result in the
**"Page self-check"** card in the *Pipeline* section, e.g. `7 / 7 checks passed`.

## Pipeline

```
push → lint → test → build (package) → deploy
```

| Job | What it does |
|-----|--------------|
| `lint` | `npm run lint` (ESLint on `js/` and `tests/`). |
| `test` | Runs **after `lint`** (`needs: lint`). `npm test` (Jest). |
| `build` | `needs: [lint, test]`. Copies the site into `dist/`, writes `build-info.json`, uploads the Pages artifact. |
| `deploy` | Publishes to GitHub Pages. |

Because `build` needs both jobs, **deployment only happens if lint and tests both pass.**

## One-time setup

1. Create a **public** repo and push everything to `main` (use git so the hidden `.github` folder is included).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Site URL: `https://<your-username>.github.io/<repo-name>/`

## Demo: a failing test, then a passing test

**Failing test**

1. In `js/quality.js`, inside `boundaryValues`, change `max + 1` to `max + 2`:
   ```js
   const values = [min - 1, min, min + 1, max - 1, max, max + 2];
   ```
2. Commit and push to `main`.
3. In the **Actions** tab the run shows **Lint ✅ → Run Jest ❌**. Open the failed job and you will see, for example:
   `Expected: [17, 18, 19, 59, 60, 61]   Received: [17, 18, 19, 59, 60, 62]`.
   **Build and Deploy are skipped**, so the live site is unchanged. Screenshot this.

**Passing test**

4. Change `max + 2` back to `max + 1`, commit and push.
5. The run goes **Lint ✅ → Test ✅ → Package ✅ → Deploy ✅**. Screenshot this too.

(You can still demo the linter from last week by deleting a semicolon: the run fails at **Lint**, and Test is skipped.)

### Optional: do it the TDD way (as in the lecture)

1. Add a new test to `tests/quality.test.js` for a function that does not exist yet, push, and watch it fail (red).
2. Implement the function in `js/quality.js`, push, and watch it pass (green).

## Run locally

```bash
npm install
npm run lint     # prints nothing when clean
npm test         # Jest
npm run serve    # http://localhost:8080
```
