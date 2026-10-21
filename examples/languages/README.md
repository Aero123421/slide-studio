# One page in ten languages

One real page — a city library board's monthly finding — set natively in English,
Japanese, Simplified Chinese, Traditional Chinese (Taiwan), Korean, Arabic, Hindi,
German, French and Spanish. Each version has a claim headline computed from the
data, a figure-engine line chart labelled in its own language, a big number, a short
qualifying note and a source line. Use it as the model for any deck that must ship
in more than one language: translate the argument, then recompose the page for the
script — never pour translated strings into English coordinates.

```sh
node scripts/craft.mjs build examples/languages/deck.mjs --out languages.html --force
```

## How the module is built

1. **Data once.** `loans` holds monthly e-book, print and audiobook loans (January
   2023 – December 2025, illustrative); `closure` holds the three renovated branches.
2. **Facts derived once.** The first month of the unbroken e-book lead (`since`),
   the 2025 e-book total and its growth on 2024 are computed — every page states the
   same numbers because no page types them.
3. **A locale table.** Per language only what really differs: the words (`copy`),
   the BCP 47 tag used for every number and date (`numbers`), how a large count is
   said (`big`: million / 万 / 萬 / 만 / लाख / Mio. / مليون), the chart's unit
   (`axis`: thousands, or 万 for East Asian readers), counting words for prose
   (`words`) and the reading direction.
4. **`facts(L)`** formats the shared facts for one locale with `fmt(v, {locale})`,
   `Intl.DateTimeFormat`, `Intl.ListFormat` and `Intl.PluralRules`.
5. **`page(L)`** composes one page from the grammar (`st-head`, `st-fig`, `st-rail`,
   `st-source`) and one color system (`cs-civic-calm`); the deck CSS only sets fonts
   and the type scale per script.

## What each page demonstrates

| Page | Look at |
|---|---|
| **en** English | The Latin reference: display face with −0.015em tracking, a balanced two-line headline, `1.49 million` spelled out, `120,000`, "B04, B09, and B12" from `Intl.ListFormat`, "Three branches" spelled out at the start of a sentence, `e‑books` held together by a no-break hyphen. |
| **ja** 日本語 | Headline broken between phrases (`word-break: auto-phrase` in Chromium; `keep-all` + `<wbr>` marks elsewhere), `palt` kerning, no negative tracking, loose leading (1.75) in the note, strict kinsoku. Counts in myriads: `149万件`, `11万9100件`; the chart axis counts in 万件; ranges with 〜. |
| **zh-Hans** 简体中文 | Simplified forms with a Simplified font named first (Han unification: the `lang` and the font decide the glyphs), full-width punctuation, phrase marks (`|` → `<wbr>`) so words such as 纸质书 and 借阅量 never split, `11.91万次` as Chinese media write decimals of 万, `三家分馆` in words. |
| **zh-Hant** 繁體中文 | Written the way Taiwan writes it — 紙本書, 借閱, 成長, 萬, 示意資料 — not converted from Simplified; the stack names Traditional faces first so punctuation sits centred in the em box on systems that have them. |
| **ko** 한국어 | Korean separates words with spaces, so `word-break: keep-all` stops breaks inside words; native counting words (`분관 세 곳`), the particle after the parenthesis (`곳(…)이`), myriads with a space (`11만 9100건`), `~` for ranges. |
| **ar** العربية | The page reads right to left — headline on the right, rail on the left (`st--left`), source line mirrored — but the chart keeps time running left to right: a time axis is a number line, not a reading order, so it is not mirrored (the `<figure>` carries `dir="ltr"`, which also keeps the engine's label anchors correct). Arabic-Indic digits from `ar-EG` (`١٫٤٩ مليون`, `١٢٠٬٠٠٠`, `١٩٪`), plural nouns from `Intl.PluralRules` (٣ فروع, ١٤ فرعًا), branch codes isolated with `<bdi>` so "B04 وB09 وB12" keeps its order, Arabic comma and question mark (، ؟), larger type and leading, no letter-spacing. |
| **hi** हिन्दी | Devanagari needs taller leading for the marks above and below the headline bar and never takes letter-spacing (it would break the bar). Indian digit grouping (`1,20,000`) and lakh for the big number (`14.9 लाख`), the danda (।), conjuncts and nukta (ज़्यादा, ऑडियोबुक) as a shaping check. |
| **de** Deutsch | Soft hyphens (`&shy;`) at the joints of long compounds — Zweig·stellen, Ausleih·zahlen, Wieder·eröffnung — so lines break where an editor would; `hyphens: auto` depends on a dictionary the renderer may not have. Decimal comma, `19 %` with a no-break space, `Mio.`, `E‑Books` never split after the E, "B04, B09 und B12". |
| **fr** Français | `frenchSpacing()` puts a narrow no-break space before ; ! ? and a no-break space before the colon, so a mark never starts a line; typographic apostrophe (qu’en), narrow no-break space as thousands separator (`120 000`), `1,49 million` singular by plural rule, lower-case month names (janv., déc.). |
| **es** Español | Opening ¿ for the question, `19 %` with a space as the RAE recommends, "B04, B09 y B12", `1,49 millones` by plural rule, `marzo de 2025` from `Intl.DateTimeFormat`. |

## Rules to carry into your own decks

- **Format with the page's locale, never by hand.** Numbers through `fmt(v, {locale})`;
  dates, lists and plurals through `Intl`. A year is not a quantity: format it without
  grouping (2025, not 2,025). Percent spacing is locale data too — take it from Intl.
- **Pin the numbering system** when digits matter (`ar-EG`, `ar-u-nu-latn`): the
  default for plain `ar` changed between CLDR versions.
- **Say large numbers the way the reader counts:** thousands and millions, 万 / 만
  (10⁴) in East Asia, lakh (10⁵) in India. Re-scale the axis to match.
- **Mirror the reading order, not the data.** In right-to-left pages flip the
  headline, rail and source; keep number lines (time, quantity) left to right; mirror
  a chart only when its order is a reading order (a ranked list, a process).
- **Isolate inserted identifiers** (codes, names, file names) with `<bdi>`.
- **Keep units with their numbers** and short terms together: no-break spaces and
  hyphens in spaced scripts, `white-space: nowrap` spans in CJK.
- **Break CJK headlines between phrases**, mark them in the copy; Korean breaks at spaces.
- **Size by script:** CJK headlines a little smaller and looser, Arabic and
  Devanagari larger and taller; tracking only for Latin display type.
- **Fonts:** name the Mac face first, then Windows, then Noto; put the script's own
  face first for running text (one weight across digits and letters) and the Latin
  face first in charts and big numbers (numerals that match across versions).

## Limits

The copy was written for this example and has not been reviewed by native editors;
have each language checked before you reuse it. The rendered review on the
repository's machine uses IPAPGothic (Japanese), WenQuanYi Zen Hei (Chinese and
Korean, a single weight — headlines look lighter than with PingFang or Apple SD
Gothic Neo), DejaVu Sans (Arabic) and FreeSans (Devanagari); check glyphs and
weights on the machines that will show the deck. The figure engine's `fmt` drops
the minus and plus signs for scripts whose digits are not ASCII (`ar-EG`, `hi-u-nu-deva`),
so this page states changes in words.
