// One-time development utility. Generated MP3s are portable; serving them needs no macOS tools.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, mkdtemp, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { demoStories } from '../shared/stories.js';
const exec = promisify(execFile);
const output = fileURLToPath(new URL('../frontend/public/audio/', import.meta.url));
await mkdir(output, { recursive: true });
const scratch = await mkdtemp(join(tmpdir(), 'nuzio-narration-'));
try {
  for (const story of demoStories) {
    const textPath = join(scratch, 'story.txt');
    const wavPath = join(scratch, 'story.aiff');
    await writeFile(textPath, `${story.title}.\n\n${story.summary}\n\n${story.content}`);
    await exec('say', ['-v', 'Samantha', '-r', '165', '-f', textPath, '-o', wavPath]);
    if ((await stat(wavPath)).size <= 4096) throw new Error('The local speech engine returned an empty recording. Run outside the sandbox.');
    const path = resolve(output, `${story.slug}.mp3`);
    await exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-b:a', '64k', '-ar', '24000', '-ac', '1', path]);
    const { stdout } = await exec('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', path]);
    const duration = Number(stdout.trim());
    if (!Number.isFinite(duration) || duration < 5) throw new Error(`Invalid audio: ${story.slug}`);
    console.log(`${story.slug}: ${duration.toFixed(1)} seconds`);
  }
} finally {
  await rm(scratch, { recursive: true, force: true });
}
