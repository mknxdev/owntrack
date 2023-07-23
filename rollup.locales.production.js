import fs from 'fs'
import yaml from '@rollup/plugin-yaml'

const locales = fs.readdirSync('./locales/').map((f) => `./locales/${f}`)

export default {
  input: locales,
  output: {
    name: 'OwnTrack',
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    yaml(),
    {
      name: 'es2json',
      generate(_, bundle) {
        const entry = Object.values(bundle).find((chunk) => chunk.isEntry)
        this.emitFile({
          type: 'asset',
          fileName: 'entry.json',
          source: JSON.stringify(entry.code),
        })
      },
    },
  ],
}
