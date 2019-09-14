import commonjs from 'rollup-plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve'; // resolve to include external dependencies
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
    // input: 'src/components/Calendar/wrapper.js', // Path relative to package.json
    input: 'src/entry.js',
    output: {
        name: 'RCalendar',
        exports: 'named',
    },
    plugins: [
        commonjs(),
        vue({}),
        buble(), // Transpile to ES5
        terser(), // minify
        webWorkerLoader(),
        resolve({
            only: ['date-fns'],
        }),
    ],
};
