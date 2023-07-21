import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import css from 'rollup-plugin-import-css'

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'OwnTrack',
      file: 'dist/owntrack.js',
      format: 'umd',
    },
    {
      name: 'OwnTrack',
      file: 'dist/owntrack.min.js',
      format: 'umd',
      plugins: [
        terser({
          compress: true,
        }),
      ],
    },
  ],
  plugins: [
    typescript(),
    css({
      output: 'owntrack.min.css',
      minify: true,
    }),
  ],
}
