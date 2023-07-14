import serve from 'rollup-plugin-serve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    name: 'OwnTrack',
    file: 'public/dist/owntrack.js',
    format: 'umd'
  },
  plugins: [
    serve({
      contentBase: 'public',
      port: 8080,
    }),
    typescript(),
  ]
}