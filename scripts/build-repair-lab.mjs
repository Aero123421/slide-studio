#!/usr/bin/env node
import fs from 'node:fs/promises';import path from 'node:path';
import {ROOT,renderCraft} from './craft-core.mjs';
import {lab,talk} from '../assets/repair-lab/deck.mjs';
import period from '../assets/repair-lab/period.mjs';
for(const [name,deck] of [['repair-lab',lab],['transfer-talk',talk],['period-comparison',period]]){
 await fs.writeFile(path.join(ROOT,'gallery',name+'.html'),await renderCraft(deck));
 console.log(name,deck.slides.length);
}
