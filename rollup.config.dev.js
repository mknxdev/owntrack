import serve from 'rollup-plugin-serve'
import typescript from '@rollup/plugin-typescript'
import css from 'rollup-plugin-import-css'

const plugins = [
  typescript(),
  css({
    output: 'owntrack.css',
  }),
]
if (process.env.MODE === 'local')
  plugins.splice(
    0,
    0,
    serve({
      contentBase: 'public',
      port: 8080,
    }),
  )

export default {
  input: 'src/index.ts',
  output: [
    {
      name: 'OwnTrack',
      file: 'public/dist/owntrack.js',
      format: 'umd',
    },
  ],
  plugins,
}
