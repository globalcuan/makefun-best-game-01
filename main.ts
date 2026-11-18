import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const root = import.meta.dirname;
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
await mkdir(output, { recursive: true });
await cp(resolve(root, 'game'), resolve(output, 'game'), { recursive: true, force: true });
await cp(resolve(root, 'screenshots'), resolve(output, 'screenshots'), { recursive: true, force: true });
const shotDir = resolve(output, 'screenshots');
if ((await readdir(shotDir)).length === 0) {
  // The dossier requires a cover image; use a tiny offline fallback until captures are added.
  await writeFile(resolve(shotDir, '1-cover.jpg'), Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/AP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCcf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8B/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/An//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IT//2Q==', 'base64'));
}
const dossier = await buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
await writeFile(resolve(output, 'dossier.json'), `${JSON.stringify(dossier, null, 2)}\n`);
