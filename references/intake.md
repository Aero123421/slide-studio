# Intake: a few short questions before the first page

The skill can produce very different decks: a spoken talk advanced with a clicker or a
document read alone; HTML with motion and live controls, a PDF, or a PowerPoint
colleagues can edit; a template pack or a design built from the content; terse
assertions or full sentences. A wrong guess on these costs a rebuild. So before
setting up the project, ask the person **once**, in **short multiple-choice
questions**, and only about what their request and material leave open. Everything
else (layout, chart type, wording, spacing) you decide yourself.

## How to ask

- Read the request and the supplied material first, then ask. Never ask what they
  already told you, and never ask for facts that are in their files.
- At most **six questions, in one round** (two if your host's question tool takes
  four at a time: ask the four that change the most first). One line each, 2–4
  options, your recommended option first and marked, plus "おまかせ / Up to you".
- Write the options in the person's language and in their words ("話して発表する",
  not "readingMode: live"). Each option says in a few words what it changes.
- Derive the recommendation from the material: a quarterly report suggests the QBR
  pack and a calm business color system; a research talk suggests the research pack.
- Use the host's structured question tool when there is one (for example
  `AskUserQuestion` in Claude Code); otherwise one message with numbered questions
  and lettered options, answerable as "1A 2C 3おまかせ".
- **Do not ask** when the person said to proceed without questions ("おまかせ",
  "just make it"), when nobody can answer (batch, CI, a scheduled run), or for an
  edit to an existing deck — the deck already answers them. Then choose the
  recommended options yourself.
- Record the answers, and every default you chose, under *Intake* in `brief.md`, and
  name the defaults in your final report so they can be changed.

## The questions, in order of how much a wrong guess costs

Ask a question only if its answer is open. Each answer maps to concrete choices in
this skill; follow the mapping.

### 1 · Where the deck is used

> どこで使いますか？ A. 自分が話して発表する（推奨）/ B. 読んでもらう資料（送付・配布）/ C. 両方
> Where will this be used? A. I present it live / B. people read it on their own / C. both

| Answer | Do |
|---|---|
| A live | `readingMode: 'live'`: one claim per page, readable at distance (≥ 18 px, larger where it fits), spoken detail in the notes, builds allowed |
| B read | `readingMode: 'read'`: full sentences on the page, self-explanatory figures, no reliance on motion |
| C both | `hybrid`: a live main sequence plus a clearly organized appendix or companion version (`references/writing-and-editing.md`, reading modes) |

### 2 · Files to hand over

> 最終的に必要な形式は？ A. HTML（動き・操作あり、推奨）/ B. PDF も / C. 編集できる PowerPoint / D. 見た目そのままの PowerPoint（編集不可）

| Answer | Do |
|---|---|
| A HTML | Craft route (`craft.mjs`): everything in this skill is available |
| B + PDF | Craft route; plan a complete static final build per page; font contract and `export.py` |
| C editable PPTX | **Structured route** (`studio.mjs` + `export-pptx.mjs --mode editable`): 25 native layouts, no motion or live controls, no craft template packs. Say so in the option text |
| D picture PPTX | Craft route + `export.py deck.html deck.pptx`; tell them text is not editable |

### 3 · How the presenter moves through it (only if 1 is A or C)

> 発表中の操作は？ A. キー（クリッカー）だけで進めたい（推奨）/ B. 画面のスライダー等も自分で触る / C. 聞き手に触ってもらう（自習・展示）

| Answer | Do |
|---|---|
| A keys only | Every change happens on → / Space / PageDown: builds and `data-states` transformations, no live widget on the presented path. A change a widget would show (a threshold, a closed bridge) becomes a build sequence of computed states — see the motion studies. Widgets may sit on an appendix page |
| B presenter drives | Widgets where they explain (`references/motion-and-interaction.md` §9), each with a reset and a planned path; rehearse it |
| C audience drives | Widgets with visible instructions, generous targets, reset, and a static export that stands alone |

### 4 · Starting point

> 作り方は？ A. 用途に合うテンプレートを土台にする（推奨：○○）/ B. 会社のテンプレート・過去資料に合わせる / C. 内容から一から設計する

Name the best-fitting pack in option A. Packs (`catalog.mjs take tpl-…`): 四半期業績レビュー
`tpl-qbr`, 戦略提案 `tpl-strategy`, プロジェクト月次報告 `tpl-project-status`, 年次活動報告
`tpl-impact-report`, 学会発表 `tpl-research-ja`, 講義 `tpl-lecture`, conference keynote
`tpl-keynote`, product launch `tpl-launch`, seed pitch `tpl-pitch`, magazine essay
`tpl-editorial`, incident review `tpl-architecture`, model evaluation `tpl-ml-report`.

| Answer | Do |
|---|---|
| A template | `catalog.mjs take tpl-…`, then replace every name, number and sentence; drop pages the story does not need |
| B company | Ask for the file; `references/brand.md` (capture → proof → approve). Their template wins over this skill's look |
| C from scratch | Compose from the page grammar and library studies (`catalog.mjs search`) |

### 5 · Look

> デザインの方向は？ A. 落ち着いたビジネス（推奨）/ B. 研究・技術向けの端正 / C. 印象に残るキーノート（暗い背景）/ D. 和の配色

Offer three or four directions that fit the material, each backed by a color system
(`gallery/color-systems.html`): business calm → `executive-ink`, `navy-classic-light`,
`finance-ledger`; research and engineering → `laboratory`, `journal-serif`,
`blueprint`; keynote → `keynote-dusk`, `strategy-dark`; Japanese → `wa-ai`, `wa-sumi`;
education → `classroom-bright`; public sector → `civic-calm`. If they have brand
colors or fonts, those replace this question. Skip it when they chose a template in 4
(the pack has its own art direction) unless they want to recolor it.

### 6 · Words

> 文章のスタイルは？ A. 結論を見出しにして短く（推奨）/ B. です・ます調で丁寧に / C. 体言止めのメモ調 ／ 文字量：少なめ・標準・しっかり

| Answer | Do |
|---|---|
| A assertions | Headlines are findings ("Valley took 25% of Q3 orders"), body trimmed to the evidence |
| B polite prose | Full sentences, です・ます, still one claim per page |
| C notes style | Noun-ending phrases; keep numbers, units and conditions intact |

Amount of text follows question 1 unless they say otherwise. Language, length
(pages or minutes) and audience are usually in the request; ask only if missing,
folded into one of the questions above.

### Optional · Motion (only for HTML, if not settled by 3)

> 動きは？ A. 説明に必要な所だけ（推奨）/ B. なし（静止画のみ）/ C. 段階的にしっかり組み立てる

A: builds where order explains; B: no `data-step`; C: builds on most evidence pages,
still one idea per build and a complete final state.

## Example (Japanese request: 「来週の経営会議で第3四半期の業績を報告したい。数字はこのExcel」)

The request already fixes the occasion, audience and data. Ask:

1. どこで使いますか？ A. 会議で自分が話す（推奨）B. 事前に配って読んでもらう C. 両方
2. 必要な形式は？ A. HTML＋PDF（推奨）B. 編集できるPowerPoint（社内で直す場合）C. HTMLだけ
3. 発表中の操作は？ A. キーだけで進める（推奨）B. 画面も触る
4. 作り方は？ A. 「四半期業績レビュー」テンプレートを土台に（推奨）B. 会社のテンプレートに合わせる C. 一から
5. 文章は？ A. 結論を見出しに短く（推奨）B. です・ます調で丁寧に

Look is skipped because a template was recommended; length is taken from the agenda
slot if they mention it, otherwise eight to ten pages and stated as a default.
