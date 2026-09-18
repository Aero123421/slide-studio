#!/usr/bin/env python3
"""Recompute declared numeric claims from JSON. Not an arbitrary fact checker.
Numbers carry units, direction, denominator, and a rounding tolerance. No eval/code.
Optional table-cells claims bind one source version, column and evaluation protocol.
Transcription and source authenticity remain the author's responsibilities.
"""
from __future__ import annotations
import argparse,json,math,statistics,sys

def number(v,name='number'):
    if isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v):
        raise ValueError(f'{name}: finite number required (not a numeric string)')
    return v

def calculate(c,tables=None):
    op=c.get('op');v=c.get('inputs',{});u=c.get('unit')
    if not isinstance(u,str) or not u.strip():raise ValueError('Explicit unit required')
    if not isinstance(v,dict):raise ValueError('inputs must be an object')
    if op=='table-cells':
        table=(tables or {})[c['table']];column=table['columns'][c['column']]
        for field in ('source','version'):
            if not isinstance(table.get(field),str) or not table[field].strip():raise ValueError('Table requires '+field)
        for field in ('label','unit','protocol'):
            if not isinstance(column.get(field),str) or not column[field].strip():raise ValueError('Column requires '+field)
        if u!=column['unit']:raise ValueError('Claim unit differs from source column unit')
        row_ids=c['rows']
        if not isinstance(row_ids,list) or not row_ids or any(not isinstance(x,str) for x in row_ids) or len(set(row_ids))!=len(row_ids):raise ValueError('Distinct source row IDs required')
        values=[number(table['rows'][row][c['column']],row+'/'+c['column']) for row in row_ids]
        return {'values':values,'columnLabel':column['label'],'protocol':column['protocol'],'sourceVersion':table['version'],'unit':u}
    if op in ('delta','percent-change'):
        b=number(v['before']);a=number(v['after']);direction=c.get('direction')
        if direction not in ('after - before','before - after'):raise ValueError('Declare direction')
        value=a-b if direction=='after - before' else b-a
        if op=='percent-change':
            if u!='%':raise ValueError('percent-change output unit must be %')
            if b<=0:raise ValueError('Conventional percent change requires positive baseline; explain zero/negative baselines separately')
            value=100*value/b
        return {'value':value,'unit':u,'direction':direction}
    if op=='ratio':
        a=number(v['numerator']);b=number(v['denominator'])
        if b==0:raise ValueError('Undefined ratio: zero denominator')
        return {'value':a/b*(100 if u=='%' else 1),'unit':u}
    if op=='total-cost':
        months=number(v['months'])
        if months<0 or int(months)!=months:raise ValueError('months must be a nonnegative integer')
        return {'value':number(v['initial'])+number(v['monthly'])*months+number(v.get('additional',0)),'unit':u}
    if op=='paired':
        rows=v['rows'];direction=c.get('direction')
        if direction not in ('after - before','before - after'):raise ValueError('Declare direction')
        if not isinstance(rows,list) or not rows:raise ValueError('Nonempty row list required')
        ds=[];missing=[];below=above=equal=0
        for i,r in enumerate(rows):
            if r.get('before') is None or r.get('after') is None:missing.append(i);continue
            b=number(r['before']);a=number(r['after']);ds.append(a-b if direction=='after - before' else b-a)
            below+=a<b;above+=a>b;equal+=a==b
        if not ds:raise ValueError('No complete pairs')
        return {'mean':statistics.mean(ds),'sampleSD':statistics.stdev(ds) if len(ds)>1 else None,'n':len(ds),
                'missing':missing,'below':below,'above':above,'equal':equal,'unit':u,'direction':direction}
    if op=='sum':return {'value':sum(number(x) for x in v['values']),'unit':u}
    raise ValueError(f'Unknown operation: {op}')

def check_claim(c,tables=None):
    if not isinstance(c,dict):raise ValueError('Claim must be an object')
    if not isinstance(c.get('id'),str) or not c['id'].strip():raise ValueError('Claim id required')
    source=(tables or {})[c['table']]['source'] if c.get('op')=='table-cells' else c.get('source')
    if not isinstance(source,str) or not source.strip():raise ValueError('Source locator required')
    r=calculate(c,tables);expected=c.get('expected');issues=[]
    if not isinstance(expected,dict) or not expected:raise ValueError('expected display value(s) required')
    if c.get('op')=='table-cells' and not {'values','columnLabel','protocol','sourceVersion'}<=expected.keys():raise ValueError('Table claim expected requires values, columnLabel, protocol and sourceVersion')
    digits=c.get('digits',1)
    if isinstance(digits,bool) or not isinstance(digits,int) or not 0<=digits<=12:raise ValueError('digits must be 0..12')
    tolerance=.5*10**(-digits)+1e-10
    for field,written in expected.items():
        if field not in r:issues.append(f'Unknown expected field {field}');continue
        actual=r[field]
        if field=='values' and c.get('op')=='table-cells':
            if not isinstance(written,list) or len(written)!=len(actual):issues.append('values: row count differs');continue
            for row,a,w in zip(c['rows'],actual,written):
                number(w,'expected '+row)
                if abs(a-w)>tolerance:issues.append(f'{row}/{c["column"]}: written {w}, source cell {a}')
        elif isinstance(actual,(int,float)) and not isinstance(actual,bool):
            number(written,'expected '+field)
            t=1e-10 if field in ('n','below','above','equal') else tolerance
            if abs(actual-written)>t:issues.append(f'{field}: written {written}, computed {actual} (unit {r["unit"]})')
        elif written!=actual:issues.append(f'{field}: written {written!r}, computed {actual!r}')
    return {'id':c['id'],'source':source,'computed':r,'issues':issues,'passed':not issues}

def check(document):
    if not isinstance(document,dict) or not isinstance(document.get('claims'),list):raise ValueError('claims array required')
    tables=document.get('tables',{})
    if not isinstance(tables,dict):raise ValueError('tables must be an object')
    results=[];ids=set()
    for c in document['claims']:
        try:
            if not isinstance(c,dict):raise ValueError('Claim must be an object')
            if c.get('id') in ids:raise ValueError('Duplicate claim id')
            ids.add(c.get('id'));results.append(check_claim(c,tables))
        except (ValueError,KeyError,TypeError,OverflowError) as e:
            results.append({'id':c.get('id','?') if isinstance(c,dict) else '?','passed':False,'issues':[str(e)]})
    return {'passed':bool(results) and all(r['passed'] for r in results),'claims':results,
            'limits':'Validates declared inputs, arithmetic and table-cell bindings. Does not authenticate or transcribe sources, inspect rendered labels, check history or infer causality. A consistently mistranscribed source still needs independent review.'}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input');a=p.parse_args()
    try:
        with open(a.input,encoding='utf-8') as f:r=check(json.load(f))
        print(json.dumps(r,ensure_ascii=False,indent=2));return 0 if r['passed'] else 2
    except Exception as e:print('Evidence:',e,file=sys.stderr);return 1
if __name__=='__main__':sys.exit(main())
