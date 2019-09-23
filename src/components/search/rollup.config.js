import commonjs from 'rollup-plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import { terser } from 'rollup-plugin-terser';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import resolve from 'rollup-plugin-node-resolve'; // resolve to include external dependencies

export default {
    input: 'src/components/search/wrapper.js',
    output: [
        {
            name: 'RSearch',
            exports: 'named',
            file: 'dist/renderless/search/index.esm.js',
            format: 'es',
        },
        {
            name: 'RSearch',
            exports: 'named',
            file: 'dist/renderless/search/index.umd.js',
            format: 'umd',
        },
        {
            name: 'RSearch',
            exports: 'named',
            format: 'iife',
            file: 'dist/renderless/search/index.min.js',
        },
    ],
    plugins: [
        commonjs(),
        vue(),
        buble(),
        terser(),
        webWorkerLoader(),
        resolve({
            only: ['promise-worker'],
        }),
    ],
};
