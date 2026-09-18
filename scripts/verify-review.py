#!/usr/bin/env python3
"""Read-only final-artifact/QA match gate. Passing does NOT approve design or facts.
Run on the exact audience HTML after the last build (including --strip-notes).
"""
from __future__ import annotations
import argparse,hashlib,json,re,sys
from pathlib import Path

def digest(file):return hashlib.sha256(file.read_bytes()).hexdigest()

def verify(file,report):
    file=Path(file).resolve();issues=[]
    if not isinstance(report,dict):raise ValueError('QA report object required')
    sha=report.get('sha256')
    if not isinstance(sha,str) or not re.fullmatch(r'[0-9a-f]{64}',sha):issues.append('Missing or invalid QA input hash')
    elif digest(file)!=sha:issues.append('Final HTML differs from the QA input; rerun QA on this exact file')
    if report.get('passed') is not True or report.get('automatedChecksPassed') is not True:issues.append('Automated QA did not pass')
    rows=report.get('results')
    slides=report.get('slides')
    if type(slides) is not int or slides<1 or not isinstance(rows,list) or not rows:
        issues.append('No verifiable inspected slides')
    else:
        finals={r.get('slide') for r in rows if isinstance(r,dict) and r.get('state')=='final' and r.get('passed') is True}
        if finals!=set(range(1,slides+1)):issues.append('QA does not contain every final slide')
        if any(not isinstance(r,dict) or r.get('passed') is not True for r in rows):issues.append('One or more inspected states failed')
    assets=report.get('localAssets',[])
    if not isinstance(assets,list):raise ValueError('localAssets must be an array')
    for asset in assets:
        if not isinstance(asset,dict) or not isinstance(asset.get('path'),str) or Path(asset['path']).is_absolute():
            issues.append('Invalid local asset record');continue
        target=file.parent/asset['path']
        if not target.is_file() or digest(target)!=asset.get('sha256'):issues.append('Loaded local asset is missing or changed: '+asset['path'])
    if report.get('errors') or report.get('blockedNetwork') or report.get('duplicateIds') or report.get('playerWarnings'):issues.append('QA reports unresolved runtime or resource errors')
    if report.get('cssIntegrity',{}).get('passed') is False:issues.append('CSS integrity failed')
    return {'passed':not issues,'artifact':file.name,'sha256':digest(file),'issues':issues,
            'status':'qa-current-review-required' if not issues else 'qa-not-ready',
            'deliveryApproved':False,'limits':[
                'Checks consistency of supplied QA evidence, not its authenticity or completeness of human review.',
                'Separate fact, image, design, widget-branch and requested-export review is still required.',
                'Older reports without localAssets do not fingerprint linked resources. Prefer new QA on the final audience HTML.',
                'A matching file hash does not establish matching fonts, browser or operating system.']}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input');p.add_argument('--report',required=True);a=p.parse_args()
    try:
        r=verify(a.input,json.loads(Path(a.report).read_text(encoding='utf-8')))
        print(json.dumps(r,ensure_ascii=False,indent=2));return 0 if r['passed'] else 2
    except Exception as e:print('Verify review:',e,file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
