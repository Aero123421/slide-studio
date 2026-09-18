#!/usr/bin/env python3
"""Validate claim/evidence relationships; editorial hints are not truth or style verdicts."""
import argparse,json,re,sys
STATUSES={'observed','reported','inferred','proposed','illustrative','unknown'}
EMPTY=re.compile(r'\b(revolutionary|game[- ]changing|unleash|seamless|unprecedented|paradigm shift)\b|革新的|圧倒的|最大化|赋能|革命性',re.I)
def lint(story):
    errors=[];warnings=[]
    if not isinstance(story,dict):return {'errors':['Story must be an object'],'warnings':[],'passed':False}
    sources=story.get('sources',[]);slides=story.get('slides',[])
    if not isinstance(sources,list) or not isinstance(slides,list):return {'errors':['sources/slides must be arrays'],'warnings':[],'passed':False}
    ids=set()
    for s in sources:
        if not isinstance(s,dict) or not s.get('id') or not s.get('locator'):errors.append('Each source needs id and locator');continue
        if s['id'] in ids:errors.append('Duplicate source ID: '+s['id'])
        ids.add(s['id'])
    if not slides:errors.append('No slide records')
    seen=set();titles={}
    for i,s in enumerate(slides):
        if not isinstance(s,dict):errors.append(f'Slide {i+1}: object required');continue
        label=str(s.get('id',i+1));status=s.get('status');evidence=s.get('evidence',[])
        for key in ['id','job','title','status']:
            if not isinstance(s.get(key),str) or not s[key].strip():errors.append(label+': missing '+key)
        if label in seen:errors.append(label+': duplicate slide id')
        seen.add(label)
        if status not in STATUSES:errors.append(label+': unknown claim status')
        if not isinstance(evidence,list):errors.append(label+': evidence must be an array');evidence=[]
        for x in evidence:
            if not isinstance(x,str) or x not in ids:errors.append(label+': unresolved evidence reference '+str(x))
        if status in {'observed','reported','inferred'} and not evidence:errors.append(label+': evidence required for '+status)
        if status=='inferred' and not s.get('scope'):warnings.append(label+': state inference scope/assumptions')
        title=s.get('title','');claim=s.get('claim','');copy=title+' '+claim
        if EMPTY.search(copy):warnings.append(label+': abstract promotional wording; replace with subject, action, condition and evidence where appropriate')
        if title in titles:warnings.append(label+': title repeats '+titles[title])
        titles[title]=label
        if not s.get('visual'):warnings.append(label+': explain the visual job, including a deliberate text-only choice')
        if not s.get('static'):warnings.append(label+': declare what remains in static export')
        if status=='illustrative' and re.search(r'proven|guarantee|実証|保証',copy,re.I):warnings.append(label+': illustration may be framed as proof')
    return {'errors':errors,'warnings':warnings,'passed':not errors,'limits':'Checks declarations and language hints, not factual truth, native fluency, design quality or an AI-writing detector.'}
def main():
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('story');a.add_argument('--strict',action='store_true');args=a.parse_args()
    try:r=lint(json.load(open(args.story,encoding='utf-8')));print(json.dumps(r,ensure_ascii=False,indent=2));return 2 if r['errors'] or (args.strict and r['warnings']) else 0
    except Exception as e:print('Editorial:',e,file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
