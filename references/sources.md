# Primary reference sources

Consulted 2026-09-06. These are references for standards and integration boundaries,
not copied templates or a claim that every optional integration was tested. The
original design guidance is the author's synthesis and practical implementation.

| Topic | Primary source | How used |
|---|---|---|
| Agent Skills structure | https://agentskills.io/specification | Frontmatter, naming, progressive references |
| Agent description design | https://agentskills.io/skill-creation/optimizing-descriptions | Task triggers and progressive retrieval |
| Codex/ChatGPT skill documentation | https://developers.openai.com/codex/skills/ | Host installation guidance; follow current redirect |
| Claude Code skills | https://code.claude.com/docs/en/skills | Folder-level install and portability |
| Motion from interactions | https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions | Suppression of nonessential interactive motion |
| Pause/stop/hide | https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html | Automatic animation controls |
| Reduced motion | https://www.w3.org/WAI/WCAG22/Techniques/css/C39 | CSS preference behavior |
| Media autoplay | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay | Explicit playback and blocked-play fallback |
| Media play promise | https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play | Promise-aware playback |
| RTL markup | https://www.w3.org/International/questions/qa-html-dir | Directionality and mixed text |
| Optional model-viewer | https://modelviewer.dev/docs/index.html | Camera controls and renderer integration boundary |
| Model loading/decoders | https://modelviewer.dev/examples/loading/ | Posters and offline decoder dependency caveat |

For publication-critical accessibility and compatibility decisions, consult the
current full standards and test the final environment. Example checks do not certify
conformance. Rights references for photographs are recorded separately in notices.

W3C contrast minimum: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
W3C non-text contrast: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
scikit-image media rights: https://scikit-image.org/docs/stable/api/skimage.data.html

## Refinement and template implementation references (3.2)

- Keyboard focus/event routing: https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
- Held keys: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat
- IME composition: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing
- Committed animation completion: https://developer.mozilla.org/en-US/docs/Web/API/Animation/finish
- Cancellation: https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel
- Finished promise: https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished
- Native placeholders: https://python-pptx.readthedocs.io/en/latest/user/placeholders-using.html
- Native slide layout API: https://python-pptx.readthedocs.io/en/latest/api/slide.html

These explain event and file-model behavior. The brand capture, six native layouts,
copy gate and spatial diagnostics in this skill are local implementations, not an
assertion that these references validate the skill’s overall design quality.
