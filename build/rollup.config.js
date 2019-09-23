import commonjs from 'rollup-plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve'; // resolve to include external dependencies
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
// import bundleWorker from 'rollup-plugin-bundle-worker';

export default {
    input: 'src/entry.js',
    output: [
        {
            name: 'RenderlessVue',
            exports: 'named',
            file: 'dist/renderless/index.esm.js',
            format: 'es',
        },
        {
            name: 'RenderlessVue',
            exports: 'named',
            file: 'dist/renderless/index.umd.js',
            format: 'umd',
        },
        {
            name: 'RenderlessVue',
            exports: 'named',
            format: 'iife',
            file: 'dist/renderless/index.min.js',
        },
    ],
    plugins: [
        commonjs(),
        vue(),
        buble(),
        terser(),
        webWorkerLoader(),
        resolve({
            only: ['date-fns', 'promise-worker'],
        }),
    ],
};
