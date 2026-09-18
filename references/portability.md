# Installation and portability

The distributable folder is `slide-studio/`, containing `SKILL.md`. Install that entire
folder, not just SKILL.md, in the agent's supported skill directory. Keep the folder
name aligned with frontmatter `name`. This is a standard Agent Skills layout with
progressive references; no provider-specific API, account or model name is required.

For an environment supporting repository skills, place it under the configured
skills directory, for example `.agents/skills/slide-studio/`. Claude Code supports
`.claude/skills/slide-studio/` for a project and `~/.claude/skills/slide-studio/` for
personal installation. Verify the host's current documentation; installation paths
can differ. A manual fallback is to give a file-capable coding agent the local path
and ask it to read `SKILL.md` before working. Do not claim every model automatically
discovers every directory convention.

## Dependencies are task-specific

Open the provided gallery HTML without installation. Author/build custom HTML with
Node.js 20 or newer. Node 22 is the release test environment. Python QA needs Python
3.10+ with Playwright, Pillow and Chromium. Fidelity PPTX also uses python-pptx. Native
PPTX uses pptxgenjs. Exact versions used for the release are in dependency files.

```sh
# Run inside the extracted skill; use a local environment.
python -m venv .venv
# macOS/Linux: . .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m playwright install chromium
# Only for native PPTX and Node browser tests if needed:
npm install
```

The commands require network access during dependency installation, not for viewing
bundled galleries. Do not install globally or bypass corporate policy. Linux may
need system browser libraries; the agent should explain the actual missing library,
not silently run elevated commands. `SLIDE_STUDIO_CHROMIUM` may point to an approved
existing browser. `SLIDE_STUDIO_NODE_MODULES` may point to an existing package bundle.

Use `python` or `python3` as appropriate; the compatibility render wrapper accepts
`PYTHON`. Use quoted paths on all platforms. Node scripts resolve their own skill root.
They do not depend on a hardcoded developer home directory.

## Smoke test

```sh
node scripts/catalog.mjs search "comparison"
node scripts/catalog.mjs take motion-focal-reveal ./smoke-study
node scripts/craft.mjs build ./smoke-study/deck.mjs --out ./smoke-study/deck.html
python scripts/qa.py ./smoke-study/deck.html --out ./smoke-study/.studio-review/current --check
```

Use an actual catalog ID returned by search if a particular example ID changes.
`node --test tests/*.test.mjs` runs dependency-light software tests. Python tests use
`python -m unittest discover -s tests -p 'test_*.py'`. Browser regression tests are a
separate explicit command described in the README. These tests do not require API keys.
