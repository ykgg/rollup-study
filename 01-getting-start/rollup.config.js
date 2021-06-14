import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        // file: 'dist/bundle.js',
        // format: 'iife' // 输出格式 （iife：自调用函数）
        dir: 'dist',
        format: 'amd'
    },
    plugins: [
        json(),// 把调用的结果放到数组当中，而不是将函数放进去
        resolve(),
        commonjs(),
    ]
}