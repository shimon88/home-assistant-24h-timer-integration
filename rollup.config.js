import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const dev = process.env.ROLLUP_WATCH;

export default [{
  input: 'shabbat-clock-card.ts',
  output: {
    file: 'shabbat-clock-card.js',
    format: 'es',
    sourcemap: dev ? true : false,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      declaration: false,
      declarationMap: false,
      outDir: 'dist',
      rootDir: '.',
    }),
    !dev && terser({
      format: {
        comments: false,
      },
    }),
  ].filter(Boolean),
  external: [],
}, {
  input: 'shabbat-clock-card-editor.ts',
  output: {
    file: 'shabbat-clock-card-editor.js',
    format: 'es',
    sourcemap: dev ? true : false,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      declaration: false,
      declarationMap: false,
      outDir: '.',
      rootDir: '.',
    }),
    !dev && terser({
      format: {
        comments: false,
      },
    }),
  ].filter(Boolean),
  external: [],
}];
