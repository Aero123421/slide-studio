/** Advisory editorial patterns, not an AI-authorship detector or a style ban.
 * Use quotes as review targets. Never replace them mechanically with a new slogan.
 */
export function reviewCopy(slides,{language='en'}={}) {
  const findings=[];let contrasts=0;
  for(const [index,s] of slides.entries()) {
    const id=s.id||String(index+1),title=String(s.title||''),body=String(s.body||'');
    const text=title+' '+body;
    if(/ではなく|じゃなく|not\b.{0,70}\bbut\b/i.test(title))contrasts++;
    for(const [pattern,message] of [
      [/正直に(?:言|お伝|お知)|本当の価値|(?:真|ほんとう)の力|価値を紡|可能性を広げ|未来を描/gu,'Check whether this signals sincerity or meaning instead of providing the specific fact.'],
      [/\b(?:the power of|more than just|a journey of|unlock|reimagine|seamlessly)\b/gi,'Check whether the claim survives as a literal, scoped statement. Poetic voice is allowed when it genuinely fits.'],
      [/読み方[：:]|(?:今日|本日)の(?:ゴール|約束|学び)|(?:まず押さえる|つかんで帰る)/gu,'Check whether this orientation is needed here or repeats the headline/previous page.'],
      [/資料(?:の目的|読み方)|(?:PDF|印刷)(?:時|では|の場合)/gu,'Check audience relevance; move production/export explanations to notes unless they are the actual subject.']
    ])for(const m of text.matchAll(pattern))findings.push({slide:id,quote:m[0],message});
    // A Japanese deck can intentionally contain names, equations and translations.
    // Unexpected script mixing is a review warning, never silent transliteration.
    const lang=s.language||language;
    if(/^ja\b/.test(lang)&&/[\u0900-\u097f]/u.test(text)&&!(s.allowedScripts||[]).includes('Devanagari'))
      findings.push({slide:id,quote:text.match(/[\u0900-\u097f]+/u)[0],message:'Unexpected Devanagari inside Japanese copy. Check source text before blaming the PDF font.'});
    if(title.trim()&&body.trim().startsWith(title.trim()))findings.push({slide:id,quote:title,message:'Body begins by repeating the title. Keep it only if the repetition has a reading function.'});
  }
  if(slides.length>=4&&contrasts>=Math.ceil(slides.length*.3))findings.push({slide:'deck',quote:`${contrasts}/${slides.length} titles`,message:'Repeated not-A-but-B rhetoric. Check each contrast against evidence; do not manufacture an opposing claim.'});
  return {findings,limits:'These are prompts for editing, not errors, bans, or a prose-quality score.'};
}
