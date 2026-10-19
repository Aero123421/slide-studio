// Worked example · One page, ten languages.
//
// A city library board's monthly page — claim, chart, qualifying note, source — set
// natively in English, Japanese, Simplified and Traditional Chinese, Korean, Arabic,
// Hindi, German, French and Spanish. The data and every derived number exist once, at
// the top. Each language contributes only what really differs: its words, its number
// and date conventions, its plural and list rules, its fonts and its reading direction.
//
// Build: node scripts/craft.mjs build examples/languages/deck.mjs --out languages.html --force
import fs from 'node:fs/promises';
import { lineChart, theme, fmt } from '../../assets/runtime/figure.mjs';

// ---------------------------------------------------------------- page grammar + color
// Read the grammar and one color system from the skill, exactly as `craft.mjs init` does.
const read = rel => fs.readFile(new URL(rel, import.meta.url), 'utf8');
const SYSTEM = 'civic-calm';                       // public-service palette: teal accent, calm greys
const frame = await read('../../assets/runtime/study-frame.css');
const colors = (await read('../../assets/color-systems/color-systems.css'))
  .match(new RegExp(`/\\*[^*]*\\*/\\n\\.cs-${SYSTEM}\\{[^}]*\\}`))[0];

// ---------------------------------------------------------------- 1 · data (illustrative)
// Loans per calendar month in a fictional city library network, January 2023 – December 2025.
const network = { branches: 14 };
const loans = {
  ebook: [81300, 76400, 81400, 80500, 80200, 83700, 91300, 92000, 85000, 88900, 91200, 94300,
    99800, 94200, 99100, 98100, 96900, 102200, 111800, 112700, 104100, 108100, 109800, 113300,
    119800, 113400, 120000, 117400, 116900, 123300, 131800, 133600, 123300, 127600, 130100, 133900],
  print: [147700, 141100, 145100, 141100, 138100, 144700, 154000, 150400, 136200, 137400, 137300, 130700,
    140600, 132800, 138000, 133400, 130500, 138100, 143800, 141300, 118600, 119600, 117300, 114200,
    121300, 115300, 119100, 115600, 114000, 118700, 124400, 122200, 110700, 112500, 110800, 106000],
  audio: [28200, 26500, 28900, 29000, 28500, 30100, 33400, 33700, 31300, 32600, 33600, 35200,
    38000, 35700, 38300, 37200, 37500, 39000, 42400, 43000, 40600, 41600, 43300, 44500,
    46600, 43700, 46100, 46600, 46500, 48000, 51600, 52500, 48300, 50900, 51800, 53400],
};
// Three branches closed for renovation; they reopen after the period shown.
const closure = { branches: ['B04', 'B09', 'B12'], from: '2024-09', reopens: '2026-03' };

// ---------------------------------------------------------------- 2 · derived facts
const month = key => { const [y, m] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, 1)); };
const months = loans.print.map((_, i) => new Date(Date.UTC(2023, i, 1)));
const ahead = loans.ebook.map((v, i) => v > loans.print[i]);
const since = ahead.findIndex((_, i) => ahead.slice(i).every(Boolean));   // first month of the unbroken lead
if (since < 1) throw Error('The claim needs a month from which e-books lead without a break.');
const closedFrom = months.findIndex(d => +d === +month(closure.from));
const lastYear = months.at(-1).getUTCFullYear();
const yearTotal = (series, year) => series.reduce((s, v, i) => s + (months[i].getUTCFullYear() === year ? v : 0), 0);
const ebookYear = yearTotal(loans.ebook, lastYear);
const growth = (ebookYear / yearTotal(loans.ebook, lastYear - 1) - 1) * 100;   // percent
const AXIS_MAX = 200000;                            // same headroom on every page, whatever the unit

// ---------------------------------------------------------------- 3 · typographic helpers
// Never break a number from its unit, a date, or "E-Books" after its "E-": no-break spaces and
// hyphens in spaced scripts; a nowrap span in Chinese, Japanese and Korean, where no space marks the unit.
const CJK = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;
const nb = s => (CJK.test(s) ? `<span class="nb">${s}</span>` : s.replace(/ (?![^<]*>)/g, '\u00A0').replace(/-(?![^<]*>)/g, '\u2011'));
const bdi = s => `<bdi>${s}</bdi>`;                 // isolate an inserted identifier from the text direction
const plain = s => s.replace(/<[^>]+>/g, '').replace(/&shy;/g, '').replace(/\|/g, '');
// Chinese and Japanese copy marks where a line may break with "|"; with word-break: keep-all
// the browser breaks only there, so words (纸质书, 借阅量) and number+unit never split.
const phrases = s => s.replace(/\|/g, '<wbr>');
const cap = s => s.charAt(0).toLocaleUpperCase() + s.slice(1);
// French sets a no-break space before ; ! ? (narrow) and before a colon (full width).
const frenchSpacing = s => s.replace(/\s*([;!?])/g, ' $1').replace(/\s+:(?=\s)/g, ' :');
// Japanese and Korean write exact counts in myriads: 119,100 → 11万9100 / 11만 9100.
const myriad = (v, unit, gap = '') => `${Math.floor(v / 1e4)}${unit}${v % 1e4 ? gap + (v % 1e4) : ''}`;

/** Everything a page needs in its own locale, from the shared data. */
function facts(L) {
  const loc = L.numbers;
  const date = (d, o) => new Intl.DateTimeFormat(loc, { timeZone: 'UTC', ...o }).format(d);
  const monthYear = d => date(d, { year: 'numeric', month: 'long' });
  const num = (v, o) => fmt(v, { locale: loc, ...o });
  // Percent spacing is locale data too (19 % in German and French, ١٩٪ in Arabic): take it from Intl.
  const percent = new Intl.NumberFormat(loc, { style: 'percent' }).formatToParts(1)
    .filter(p => p.type !== 'integer').map(p => p.value).join('');
  const plural = (n, forms) => forms[new Intl.PluralRules(loc).select(n)] ?? forms.other;
  // "B04, B09 and B12" in the reader's own list grammar; the last pair ("and B12") never splits.
  const list = items => {
    const parts = new Intl.ListFormat(loc, { style: 'long', type: 'conjunction' }).formatToParts(items)
      .map(p => (p.type === 'element' ? bdi(p.value) : p.value));
    return parts.slice(0, -2).join('') + nb(parts.slice(-2).join(''));
  };
  const big = L.big;                                // how this language says 1,491,100
  return {
    num, plural,
    since: monthYear(months[since]), closed: monthYear(months[closedFrom]), reopens: monthYear(month(closure.reopens)),
    first: monthYear(months[0]), last: monthYear(months.at(-1)),
    year: new Intl.NumberFormat(loc, { useGrouping: false }).format(lastYear),        // a year is not a quantity: 2025, never 2,025
    prevYear: new Intl.NumberFormat(loc, { useGrouping: false }).format(lastYear - 1),
    growth: num(growth, { digits: 0, suffix: percent }),
    total: { value: num(ebookYear / big.div, { digits: big.digits }), unit: typeof big.unit === 'function' ? big.unit(ebookYear / big.div, plural) : big.unit },
    closedCount: num(closure.branches.length), closedN: closure.branches.length,
    closedWord: L.words?.[closure.branches.length] ?? num(closure.branches.length),   // prose spells out small counts
    branches: num(network.branches), branchesN: network.branches,
    codes: list(closure.branches),
    crossE: loans.ebook[since], crossP: loans.print[since],
    monthLabels: months.map(d => date(d, { year: 'numeric', month: 'short' })),
  };
}

// ---------------------------------------------------------------- 4 · the ten languages
// numbers: the BCP 47 tag used for every number and date; big: how a large count is said;
// axis: the chart's unit (thousands, or 万 for East Asian readers); size: chart label size.
const LANGS = [
  {
    id: 'en', lang: 'en', dir: 'ltr', numbers: 'en', autonym: 'English',
    big: { div: 1e6, digits: 2, unit: 'million' }, axis: { div: 1e3 },
    words: ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    copy: f => ({
      head: `E-book loans have outnumbered print every month since ${nb(f.since)}`,
      kpi: `E-book loans in ${f.year}, ${nb(f.growth)} more than in ${f.prevYear}`,
      note: `${cap(f.closedWord)} ${f.plural(f.closedN, { one: 'branch', other: 'branches' })} (${f.codes}) have been closed for renovation since ${nb(f.closed)}, which holds print loans down. Will ${nb('e-books')} stay ahead when they reopen in ${nb(f.reopens)}?`,
      chart: 'Library loans per month by format', axis: 'Loans per month, thousands',
      series: { ebook: 'E-books', print: 'Print books', audio: 'Audiobooks' },
      band: `${f.closedCount} branches closed`,
      callout: [f.since, `${f.num(f.crossE)} e-books, ${f.num(f.crossP)} print`],
      source: `Illustrative data · fictional city library network of ${f.branches} branches; loans per calendar month, ${f.first} to ${f.last}`,
    }),
  },
  {
    id: 'ja', lang: 'ja', dir: 'ltr', numbers: 'ja', autonym: '日本語',
    big: { div: 1e4, digits: 0, unit: '万件' }, axis: { div: 1e4 },
    copy: f => ({
      head: phrases(`電子書籍の貸出は|${nb(f.since)}以降、|毎月|紙の本を|上回っている`),
      kpi: `${f.year}年の電子書籍の貸出数${nb(`（前年比${f.growth}増）`)}`,
      note: `分館${f.closedCount}館（${f.codes}）が${nb(f.closed)}から改修で休館しており、紙の本の貸出を押し下げている。${nb(f.reopens)}の再開後も電子書籍が上回り続けるかは、まだ分からない。`,
      chart: '形態別の月間貸出数', axis: '月間貸出数（万件）',
      series: { ebook: '電子書籍', print: '紙の本', audio: 'オーディオブック' },
      band: `分館${f.closedCount}館が休館中`,
      callout: [f.since, `電子書籍${myriad(f.crossE, '万')}件、紙の本${myriad(f.crossP, '万')}件`],
      source: `架空のデータ · ${f.branches}館からなる架空の市立図書館の月別貸出数（${f.first}〜${f.last}）`,
    }),
  },
  {
    id: 'zh-Hans', lang: 'zh-Hans', dir: 'ltr', numbers: 'zh-Hans', autonym: '简体中文',
    big: { div: 1e4, digits: 0, unit: '万次' }, axis: { div: 1e4 },
    words: ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'],
    copy: f => ({
      head: phrases(`自${nb(f.since)}起，|电子书借阅量|每月都超过|纸质书`),
      kpi: phrases(`${f.year}年|电子书借阅量，|${nb(`比${f.prevYear}年增长${f.growth}`)}`),
      note: phrases(`${f.closedWord}家分馆（${f.codes}）|自${nb(f.closed)}起|闭馆翻修，|拉低了|纸质书借阅量。|分馆|将于${nb(f.reopens)}|重新开放，|届时|电子书|能否保持领先，|仍有待观察。`),
      chart: '按载体划分的每月借阅量', axis: '每月借阅量（万次）',
      series: { ebook: '电子书', print: '纸质书', audio: '有声书' },
      band: `${f.closedCount}家分馆闭馆`,
      callout: [f.since, `电子书${f.num(f.crossE / 1e4)}万次，纸质书${f.num(f.crossP / 1e4)}万次`],
      source: `示例数据 · 虚构的市立图书馆网络（${f.branches}家分馆）每月借阅量，${f.first}至${f.last}`,
    }),
  },
  {
    id: 'zh-Hant', lang: 'zh-Hant', dir: 'ltr', numbers: 'zh-Hant', autonym: '繁體中文',
    big: { div: 1e4, digits: 0, unit: '萬次' }, axis: { div: 1e4 },
    words: ['零', '一', '兩', '三', '四', '五', '六', '七', '八', '九', '十'],
    copy: f => ({
      head: phrases(`自${nb(f.since)}起，|電子書借閱量|每月都超越|紙本書`),
      kpi: phrases(`${f.year}年|電子書借閱量，|${nb(`較${f.prevYear}年成長${f.growth}`)}`),
      note: phrases(`${f.closedWord}座分館（${f.codes}）|自${nb(f.closed)}起|閉館整修，|使紙本書|借閱量下滑。|分館|預計${nb(f.reopens)}|重新開放，|屆時|電子書|能否維持領先，|仍有待觀察。`),
      chart: '各類館藏每月借閱量', axis: '每月借閱量（萬次）',
      series: { ebook: '電子書', print: '紙本書', audio: '有聲書' },
      band: `${f.closedCount}座分館閉館整修`,
      callout: [f.since, `電子書${f.num(f.crossE / 1e4)}萬次，紙本書${f.num(f.crossP / 1e4)}萬次`],
      source: `示意資料 · 虛構的市立圖書館（${f.branches}座分館）每月借閱量，${f.first}至${f.last}`,
    }),
  },
  {
    id: 'ko', lang: 'ko', dir: 'ltr', numbers: 'ko', autonym: '한국어',
    big: { div: 1e4, digits: 0, unit: '만 건' }, axis: { div: 1e4 },
    words: ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'],   // native counting words before 곳
    copy: f => ({
      head: `${nb(f.since)}부터 전자책 대출이 매달 종이책보다 많았다`,
      kpi: `${f.year}년 전자책 대출 건수, ${nb(`전년보다 ${f.growth} 증가`)}`,
      note: `분관 ${f.closedWord} 곳(${f.codes})이 ${nb(f.closed)}부터 리모델링으로 휴관해 종이책 대출이 줄었다. ${nb(f.reopens)}에 다시 문을 연 뒤에도 전자책이 앞설지는 아직 알 수 없다.`,
      chart: '자료 형태별 월별 대출 건수', axis: '월별 대출 건수(만 건)',
      series: { ebook: '전자책', print: '종이책', audio: '오디오북' },
      band: `분관 ${f.closedCount}곳 휴관`,
      callout: [f.since, `전자책 ${myriad(f.crossE, '만', ' ')}건, 종이책 ${myriad(f.crossP, '만', ' ')}건`],
      source: `가상 데이터 · 분관 ${f.branches}곳으로 이루어진 가상 시립도서관의 월별 대출 건수(${f.first}~${f.last})`,
    }),
  },
  {
    // Arabic-Indic digits, as in Egyptian and Levantine print. For Gulf or Maghreb readers
    // use 'ar-u-nu-latn' (Western digits); pin the numbering system either way, because the
    // default for plain 'ar' changed between CLDR versions.
    id: 'ar', lang: 'ar', dir: 'rtl', numbers: 'ar-EG', autonym: 'العربية', size: 17,
    big: { div: 1e6, digits: 2, unit: 'مليون' }, axis: { div: 1e3 },
    copy: f => ({
      head: `منذ ${nb(f.since)}، تتفوّق إعارات الكتب الإلكترونية على المطبوعة كل شهر`,
      kpi: `إعارات الكتب الإلكترونية في ${f.year}، ${nb(`بزيادة ${f.growth} عن ${f.prevYear}`)}`,
      note: `أُغلقت ${f.closedCount} ${f.plural(f.closedN, { one: 'فرع', two: 'فرعان', few: 'فروع', other: 'فرعًا' })} (${f.codes}) للتجديد منذ ${nb(f.closed)}، ما قلّل إعارات الكتب المطبوعة. فهل تبقى الكتب الإلكترونية في الصدارة بعد إعادة افتتاحها في ${nb(f.reopens)}؟`,
      chart: 'الإعارات الشهرية حسب نوع الكتاب', axis: 'الإعارات شهريًا (بالآلاف)',
      series: { ebook: 'الكتب الإلكترونية', print: 'الكتب المطبوعة', audio: 'الكتب الصوتية' },
      band: `${f.closedCount} ${f.plural(f.closedN, { few: 'فروع', other: 'فرعًا' })} مغلقة`,
      callout: [f.since, `${f.num(f.crossE)} إلكترونية مقابل ${f.num(f.crossP)} مطبوعة`],
      source: `بيانات توضيحية · شبكة مكتبات عامة متخيَّلة من ${f.branches} ${f.plural(f.branchesN, { few: 'فروع', other: 'فرعًا' })}؛ الإعارات الشهرية من ${f.first} إلى ${f.last}`,
    }),
  },
  {
    id: 'hi', lang: 'hi', dir: 'ltr', numbers: 'hi', autonym: 'हिन्दी', size: 17,
    big: { div: 1e5, digits: 1, unit: 'लाख' }, axis: { div: 1e3 },
    words: ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस'],
    copy: f => ({
      head: `${nb(f.since)} से हर महीने छपी किताबों से ज़्यादा ${nb('ई-बुक')} उधार ली गई हैं`,
      kpi: `${f.year} में उधार ली गई ${nb('ई-बुक')}, ${nb(`${f.prevYear} से ${f.growth} ज़्यादा`)}`,
      note: `${f.closedWord} ${f.plural(f.closedN, { one: 'शाखा', other: 'शाखाएँ' })} (${f.codes}) ${nb(f.closed)} से मरम्मत के लिए बंद हैं, इसलिए छपी किताबें कम ली गईं। ${nb(f.reopens)} में इनके दोबारा खुलने के बाद भी क्या ${nb('ई-बुक')} आगे रहेंगी?`,
      chart: 'हर महीने उधार ली गई किताबें, रूप के अनुसार', axis: 'हर महीने उधार ली गई किताबें (हज़ार में)',
      series: { ebook: 'ई-बुक', print: 'छपी किताबें', audio: 'ऑडियोबुक' },
      band: `${f.closedCount} शाखाएँ बंद`,
      callout: [f.since, `${f.num(f.crossE)} ई-बुक, ${f.num(f.crossP)} छपी किताबें`],
      source: `उदाहरण के आँकड़े · ${f.branches} शाखाओं वाला एक काल्पनिक नगर पुस्तकालय; ${f.first} से ${f.last} तक हर महीने उधार ली गई किताबें`,
    }),
  },
  {
    id: 'de', lang: 'de', dir: 'ltr', numbers: 'de', autonym: 'Deutsch',
    big: { div: 1e6, digits: 2, unit: 'Mio.' }, axis: { div: 1e3 },
    words: ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'],
    copy: f => ({
      head: `Seit ${nb(f.since)} werden jeden Monat mehr ${nb('E-Books')} ausgeliehen als gedruckte Bücher`,
      kpi: `E-Book-Ausleihen ${f.year}, ${nb(f.growth)} mehr als ${f.prevYear}`,
      // Soft hyphens (&shy;) mark where a German editor would split the long compounds.
      note: `${cap(f.closedWord)} Zweig&shy;stellen (${f.codes}) sind seit ${nb(f.closed)} wegen Sanierung geschlossen; das drückt die Ausleih&shy;zahlen gedruckter Bücher. Bleiben ${nb('E-Books')} auch nach der Wieder&shy;eröffnung im ${nb(f.reopens)} vorn?`,
      chart: 'Ausleihen pro Monat nach Medienart', axis: 'Ausleihen pro Monat, in Tausend',
      series: { ebook: 'E-Books', print: 'Gedruckte Bücher', audio: 'Hörbücher' },
      band: `${f.closedCount} Zweigstellen geschlossen`,
      callout: [f.since, `${f.num(f.crossE)} E-Books, ${f.num(f.crossP)} gedruckte Bücher`],
      source: `Illustrative Daten · fiktives Stadt&shy;bibliotheks&shy;netz mit ${f.branches} Zweigstellen; Ausleihen je Kalender&shy;monat, ${f.first} bis ${f.last}`,
    }),
  },
  {
    id: 'fr', lang: 'fr', dir: 'ltr', numbers: 'fr', autonym: 'Français',
    big: { div: 1e6, digits: 2, unit: (v, plural) => plural(v, { one: 'million', other: 'millions' }) }, axis: { div: 1e3 },
    words: ['aucune', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'],
    copy: f => ({
      head: frenchSpacing(`Depuis ${nb(f.since)}, on emprunte chaque mois plus de livres numériques que de livres imprimés`),
      kpi: frenchSpacing(`Prêts de livres numériques en ${f.year}, soit ${nb(f.growth)} de plus qu’en ${f.prevYear}`),
      note: frenchSpacing(`${cap(f.closedWord)} annexes (${f.codes}) sont fermées pour travaux depuis ${nb(f.closed)} : les prêts de livres imprimés en pâtissent. Les livres numériques garderont-ils l’avance après leur réouverture, en ${nb(f.reopens)} ?`),
      chart: 'Prêts mensuels par support', axis: 'Prêts par mois, en milliers',
      series: { ebook: 'Livres numériques', print: 'Livres imprimés', audio: 'Livres audio' },
      band: `${f.closedCount} annexes fermées`,
      callout: [cap(f.since), `${f.num(f.crossE)} numériques contre ${f.num(f.crossP)} imprimés`],
      source: frenchSpacing(`Données fictives · réseau fictif de ${f.branches} bibliothèques municipales ; prêts par mois civil, de ${f.first} à ${f.last}`),
    }),
  },
  {
    id: 'es', lang: 'es', dir: 'ltr', numbers: 'es', autonym: 'Español',
    big: { div: 1e6, digits: 2, unit: (v, plural) => plural(v, { one: 'millón', other: 'millones' }) }, axis: { div: 1e3 },
    words: ['ninguna', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'],
    copy: f => ({
      head: `Desde ${nb(f.since)}, cada mes se prestan más libros electrónicos que impresos`,
      kpi: `Préstamos de libros electrónicos en ${f.year}, un ${nb(f.growth)} más que en ${f.prevYear}`,
      note: `${cap(f.closedWord)} sedes (${f.codes}) están cerradas por obras desde ${nb(f.closed)}, lo que reduce los préstamos de libros impresos. ¿Seguirán por delante los libros electrónicos cuando reabran, en ${nb(f.reopens)}?`,
      chart: 'Préstamos mensuales por formato', axis: 'Préstamos al mes, en miles',
      series: { ebook: 'Libros electrónicos', print: 'Libros impresos', audio: 'Audiolibros' },
      band: `${f.closedCount} sedes cerradas`,
      callout: [cap(f.since), `${f.num(f.crossE)} electrónicos frente a ${f.num(f.crossP)} impresos`],
      source: `Datos ilustrativos · red ficticia de ${f.branches} bibliotecas municipales; préstamos por mes natural, de ${f.first} a ${f.last}`,
    }),
  },
];

// ---------------------------------------------------------------- 5 · one composition
const t = theme();
const NOTES = {
  en: 'Latin reference page. Display face with slight negative tracking and a balanced two-line headline; tabular figures in the chart; dates, lists and plurals come from Intl, not from typing.',
  ja: 'Japanese: headline broken between phrases (auto-phrase in Chromium, keep-all + <wbr> elsewhere), strict kinsoku, no negative tracking, looser leading. Exact counts in myriads (12万件, 11万9100件); the axis counts in 万件.',
  'zh-Hans': 'Simplified Chinese: Simplified forms and a Simplified font (Han unification needs lang + the right font), full-width punctuation, phrase breaks marked with <wbr>, 万 for large counts, decimals in 万 (11.91万次).',
  'zh-Hant': 'Traditional Chinese written as Taiwan writes it (紙本書, 借閱, 成長, 萬), not converted from Simplified; the font stack names Traditional faces first so punctuation sits centred.',
  ko: 'Korean: words are separated by spaces, so word-break: keep-all stops breaks inside words; myriad counts (11만 9100건); tilde for ranges in the source line.',
  ar: 'Arabic: right-to-left page (headline right, rail left, source mirrored) but the time axis still runs left to right — a number line, not a reading order. Arabic-Indic digits from ar-EG, plural nouns from Intl.PluralRules (٣ فروع, ١٤ فرعًا), codes isolated with <bdi>, larger size and leading, no letter-spacing.',
  hi: 'Hindi: Devanagari needs taller leading for marks above and below the headline bar and never takes letter-spacing; Indian digit grouping (1,20,000) and lakh for the big number (14.9 लाख); danda (।) ends the sentence.',
  de: 'German: long compounds carry soft hyphens (U+00AD) at their joints (Zweig-stellen, Ausleih-zahlen, Wieder-eröffnung), so they break where an editor would; decimal comma, "19 %" with a no-break space, "Mio." for millions, E-Books never split after the E.',
  fr: 'French: a helper inserts the no-break spaces before : ; ? (fine space before ; ! ?), typographic apostrophes, narrow no-break space as thousands separator (120 000), "1,49 million" singular by plural rule.',
  es: 'Spanish: opening ¿ for the question, decimal comma, "19 %" with a space as the RAE recommends, "y" before the last list item from Intl.ListFormat, "millones" by plural rule.',
};

function page(L) {
  const f = facts(L), c = L.copy(f), rtl = L.dir === 'rtl';
  const scale = v => v / L.axis.div;
  const chart = lineChart({
    id: `language-${L.id}-fig`, width: 800, height: 482, locale: L.numbers, fontSize: L.size ?? 16,
    title: c.chart, desc: plain(c.head),
    x: f.monthLabels, xEvery: 12, yDomain: [0, scale(AXIS_MAX)], zero: true,
    unit: c.axis, format: { digits: L.axis.div >= 1e4 ? 1 : 0 },
    series: [
      { name: c.series.print, values: loans.print.map(scale), color: t.c('ink') },
      { name: c.series.audio, values: loans.audio.map(scale) },
      { name: c.series.ebook, values: loans.ebook.map(scale), color: t.c('accent') },
    ],
    highlight: [c.series.ebook, c.series.print],
    bands: [{ from: f.monthLabels[closedFrom], to: f.monthLabels.at(-1), label: c.band }],
    annotate: [{ series: c.series.ebook, at: f.monthLabels[since], title: c.callout[0], text: c.callout[1], dx: -64, dy: -92, width: 210 }],
  });
  return {
    id: `language-${L.id}`, title: plain(c.head), language: L.lang, direction: L.dir,
    className: `st ${rtl ? 'st--left' : 'st--rail'} cs-${SYSTEM} lp`,
    notes: `${NOTES[L.id]}\nModify: change the data at the top; every number, date, plural and list on all ten pages recomputes. Have a native editor review new copy.`,
    sources: [{ type: 'illustrative-data', file: 'examples/languages/deck.mjs' }],
    exportPolicy: 'final',
    content: `<h1 class="st-head" data-region="title">${c.head}</h1>
<figure class="st-fig" data-region="primary" dir="ltr">${chart}</figure>
<div class="st-rail" data-region="support">
  <div class="st-kpi"><b class="st-accent">${f.total.value}<small>${f.total.unit}</small></b><span>${c.kpi}</span></div>
  <hr class="st-rule">
  <p class="st-text">${c.note}</p>
</div>
<p class="st-source" data-region="source"><span>${c.source}</span><span lang="${L.lang}">${L.autonym}</span></p>`,
  };
}

// ---------------------------------------------------------------- 6 · deck CSS
// The grammar and the color system come from the skill; these rules only set what
// differs by script. Every font stack names the Mac face first, then Windows, then
// Noto (Linux, Android), then what this repository's CI machine has installed.
const css = `${frame}
${colors}
/* ---- One page, ten languages ---- */
/* Running text: each script's own face first, so a headline's digits and letters share one weight.
   Figures and the big number: the Latin face first, so numerals match across all ten versions. */
.lp { --latin: "Inter","Helvetica Neue",Arial; --ss-font-sans: var(--latin),sans-serif; --ss-font-display: "Inter Display",var(--latin),sans-serif; }
.lp:lang(ja) { --script: "Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Noto Sans CJK JP","Yu Gothic UI","Yu Gothic",Meiryo,"IPAPGothic"; }
.lp:lang(zh-Hans) { --script: "PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC","WenQuanYi Zen Hei"; }
.lp:lang(zh-Hant) { --script: "PingFang TC","Microsoft JhengHei","Noto Sans TC","Noto Sans CJK TC","WenQuanYi Zen Hei"; }
.lp:lang(ko) { --script: "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR","Noto Sans CJK KR","WenQuanYi Zen Hei"; }
.lp:lang(ar) { --script: "Geeza Pro","Noto Naskh Arabic","Segoe UI","Tahoma","DejaVu Sans"; }
.lp:lang(hi) { --script: "Kohinoor Devanagari","Devanagari Sangam MN","Noto Sans Devanagari","Nirmala UI","FreeSans"; }
.lp:is(:lang(ja), :lang(zh), :lang(ko), :lang(ar), :lang(hi)) { --ss-font-sans: var(--script),sans-serif; --ss-font-display: var(--ss-font-sans); }
.lp:is(:lang(ja), :lang(zh), :lang(ko), :lang(ar), :lang(hi)) :is(.st-fig, .st-kpi b) { --ss-font-sans: var(--latin),var(--script),sans-serif; --ss-font-display: "Inter Display",var(--ss-font-sans); }

/* Type scale. Latin: headline 40, text 19, labels 18. CJK sets smaller and looser; Arabic and
   Devanagari larger and taller, never letter-spaced. Every headline takes two lines. */
.lp .st-head { font-size: 40px; line-height: 1.12; letter-spacing: -.015em; max-width: 1080px; }
.lp .st-rail { justify-content: flex-start; padding-top: 35px; }   /* the big number's cap line sits on the plot's top gridline */
.lp .st-kpi b { font-size: 56px; color: var(--ss-accent); }
.lp .st-kpi b small { font-size: .46em; font-weight: 600; letter-spacing: 0; margin-inline-start: .2em; }
.lp .st-kpi span { color: var(--ss-ink); }
.lp .nb { white-space: nowrap; }

.lp:is(:lang(ja), :lang(zh), :lang(ko)) .st-head { font-size: 38px; line-height: 1.42; letter-spacing: 0; font-weight: 700; max-width: 720px; word-break: keep-all; }
.lp:lang(ja) .st-head { word-break: auto-phrase; font-feature-settings: "palt" 1; letter-spacing: .02em; }
.lp:is(:lang(ja), :lang(zh), :lang(ko)) :is(.st-text, .st-kpi span) { font-size: 18px; line-height: 1.75; line-break: strict; }
.lp:lang(zh) :is(.st-text, .st-kpi span) { word-break: keep-all; }
.lp:is(:lang(ja), :lang(zh)) .st-kpi b small { margin-inline-start: .06em; }
.lp:lang(ko) { word-break: keep-all; }

.lp:lang(ar) .st-head { font-size: 40px; line-height: 1.4; letter-spacing: 0; font-weight: 700; right: var(--st-x); left: auto; }
.lp:lang(ar) :is(.st-text, .st-kpi span) { font-size: 21px; line-height: 1.7; }
.lp:lang(hi) .st-head { font-size: 40px; line-height: 1.45; letter-spacing: 0; font-weight: 700; max-width: 820px; }
.lp:lang(hi) :is(.st-text, .st-kpi span) { font-size: 19px; line-height: 1.75; }
.lp:is(:lang(ar), :lang(hi)) .st-kpi b { letter-spacing: 0; }
.lp:lang(de) { hyphens: manual; }
`;

export default {
  mode: 'workshop', sample: true,
  title: 'One page in ten languages',
  language: 'en',
  css,
  slides: LANGS.map(page),
};
