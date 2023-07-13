import serve from 'rollup-plugin-serve'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/owntrack.js',
    format: 'umd'
  },
  plugins: [
    serve({
      contentBase: 'public',
      port: 8080,
    })
  ]
}