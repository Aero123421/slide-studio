#!/usr/bin/env node
/** Compatibility wrapper. New default QA produces no loose PNGs. */
import {spawnSync} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),input=args.shift(),out=args.shift();
if(!input||!out){console.error('render.mjs deck.html REVIEW_DIRECTORY [--check]. Use python scripts/qa.py for all options.');process.exit(1)}
if(args.includes('--pdf')||args.includes('--force')){console.error('Use export.py for PDF; review cleanup is ownership-based, not --force.');process.exit(1)}
const forwarded=args.flatMap((a,i)=>a==='--states'?(args[i+1]&&!args[i+1].startsWith('--')?[a]:[a,'all']):a==='--inline'?[]:[a]);
const result=spawnSync(process.env.PYTHON||'python3',[path.join(path.dirname(fileURLToPath(import.meta.url)),'qa.py'),input,'--out',out,...forwarded],{stdio:'inherit'});if(result.error){console.error(result.error.message);process.exit(1)}process.exit(result.status??1);
