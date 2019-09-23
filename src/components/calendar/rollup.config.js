import commonjs from 'rollup-plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from 'rollup-plugin-buble'; // Transpile/polyfill with reasonable browser support
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve'; // resolve to include external dependencies

export default {
    input: 'src/components/calendar/wrapper.js',
    output: [
        {
            name: 'RCalendar',
            exports: 'named',
            file: 'dist/renderless/calendar/index.esm.js',
            format: 'es',
        },
        {
            name: 'RCalendar',
            exports: 'named',
            file: 'dist/renderless/calendar/index.umd.js',
            format: 'umd',
        },
        {
            name: 'RCalendar',
            exports: 'named',
            format: 'iife',
            file: 'dist/renderless/calendar/index.min.js',
        },
    ],
    plugins: [
        commonjs(),
        vue(),
        buble(),
        terser(),
        resolve({
            only: ['date-fns'],
        }),
    ],
};
