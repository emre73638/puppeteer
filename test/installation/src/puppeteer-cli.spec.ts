/**
 * @license
 * Copyright 2023 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {readdir} from 'node:fs/promises';
import {join} from 'node:path';

import {configureSandbox} from './sandbox.js';

describe('Puppeteer CLI', () => {
  configureSandbox({
    dependencies: ['@puppeteer/browsers', 'puppeteer-core', 'puppeteer'],
    isolateTests: true,
    env: cwd => {
      return {
        PUPPETEER_CACHE_DIR: join(cwd, '.cache', 'puppeteer'),
        PUPPETEER_SKIP_DOWNLOAD: 'true',
      };
    },
  });

  it('can launch', async function () {
    const result = spawnSync('npx', ['puppeteer', '--help'], {
      // npx is not found without the shell flag on Windows.
      shell: process.platform === 'win32',
      cwd: this.sandbox,
    });
    assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.ok(
      result.stdout.toString('utf-8').startsWith('puppeteer <command>'),
    );
  });

  it('can download a browser', async function () {
    assert.ok(!existsSync(join(this.sandbox, '.cache', 'puppeteer')));
    const result = spawnSync(
      'npx',
      ['puppeteer', 'browsers', 'install', 'chrome'],
      {
        // npx is not found without the shell flag on Windows.
        shell: process.platform === 'win32',
        cwd: this.sandbox,
        env: {
          ...process.env,
          PUPPETEER_CACHE_DIR: join(this.sandbox, '.cache', 'puppeteer'),
        },
      },
    );
    assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const files = await readdir(join(this.sandbox, '.cache', 'puppeteer'));
    assert.equal(files.length, 1, files.join());
    assert.equal(files[0], 'chrome');
  });

  it('can download all browser', async function () {
    assert.ok(!existsSync(join(this.sandbox, '.cache', 'puppeteer')));
    const result = spawnSync('npx', ['puppeteer', 'browsers', 'install'], {
      // npx is not found without the shell flag on Windows.
      shell: process.platform === 'win32',
      cwd: this.sandbox,
      env: {
        ...process.env,
        PUPPETEER_CACHE_DIR: join(this.sandbox, '.cache', 'puppeteer'),
      },
    });
    assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const files = await readdir(join(this.sandbox, '.cache', 'puppeteer'));
    assert.equal(files.length, 2, files.join());
  });
});
