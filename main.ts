import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const root = import.meta.dirname;
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
await mkdir(output, { recursive: true });
await cp(resolve(root, 'game'), resolve(output, 'game'), { recursive: true, force: true });
await cp(resolve(root, 'screenshots'), resolve(output, 'screenshots'), { recursive: true, force: true });
const dossier = await buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
await writeFile(resolve(output, 'dossier.json'), dossier);
