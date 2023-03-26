import path from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import rollup from 'rollup';

function resolveFile(filePath) {
  return path.join(__dirname, filePath);
}

const outputName = 'baseTemplatRollup';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

function getOptions(mode) {
  const result = {
    input: resolveFile('src/index.ts'),
    output: {
      file: resolveFile(`dist/${outputName}.${mode}.js`),
      format: mode,
      sourcemap: isProd,
      name: outputName,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript(),
      json(),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      isProd &&
        terser({
          compress: {
            drop_console: true,
          },
        }),
    ],
  };

  return result;
}

if (isDev) {
  const watcher = rollup.watch(getOptions('esm'));
  console.log('rollup is watching for file change...');

  watcher.on('event', (event) => {
    switch (event.code) {
      case 'START':
        console.log('rollup is rebuilding...');
        break;
      case 'ERROR':
        console.log('error in rebuilding.');
        break;
      case 'END':
        console.log('rebuild done.');
    }
  });
}

const modes = ['esm', 'cjs', 'iife'];
export default modes.map((mode) => getOptions(mode));
