import { realpathSync, rmSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const outputs = [
  { path: 'apps/api/dist', directory: true },
  { path: 'apps/web/dist', directory: true },
  { path: 'apps/api/tsconfig.build.tsbuildinfo', directory: false },
  { path: 'apps/api/tsconfig.tsbuildinfo', directory: false },
  { path: 'apps/web/node_modules/.tmp/tsconfig.app.tsbuildinfo', directory: false },
  { path: 'apps/web/node_modules/.tmp/tsconfig.node.tsbuildinfo', directory: false },
];

function assertInsideProject(path) {
  const localPath = relative(projectRoot, path);
  if (!localPath || localPath === '..' || localPath.startsWith(`..${sep}`) || isAbsolute(localPath)) {
    throw new Error(`Clean target must be inside the project: ${path}`);
  }
}

// Validate every absolute target before deleting anything, including symlink targets.
const targets = outputs.map((output) => {
  const absolutePath = resolve(projectRoot, output.path);
  assertInsideProject(absolutePath);
  try {
    assertInsideProject(realpathSync(absolutePath));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return { ...output, absolutePath };
});

for (const target of targets) {
  rmSync(target.absolutePath, {
    recursive: target.directory,
    force: true,
    maxRetries: 3,
    retryDelay: 100,
  });
  console.log(`Clean: ${target.path}`);
}

console.log('Build outputs and TypeScript caches cleaned.');
