/** Resolve from the user's project, skill package, or an explicitly supplied bundle.
 * Never install or modify global packages from inside an export command. */
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
export async function dependency(name){const roots=[process.cwd(),path.dirname(fileURLToPath(import.meta.url)),process.env.SLIDE_STUDIO_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean);for(const root of roots){try{const req=createRequire(path.join(root,'resolve.cjs'));const file=req.resolve(name);const m=await import(pathToFileURL(file));return m.default&&typeof m.default==='object'?{...m.default,...m}:m}catch(e){if(!['MODULE_NOT_FOUND','ERR_MODULE_NOT_FOUND'].includes(e.code))throw e}}throw Error(`Missing ${name}. Install the optional dependencies in a local project as described in references/verification-and-delivery.md, or set SLIDE_STUDIO_NODE_MODULES to an existing node_modules directory.`)}
