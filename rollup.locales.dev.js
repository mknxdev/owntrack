import fs from 'fs'
import YAML from 'js-yaml'

const exts = ['.yml', '.yaml']
const locales = fs
  .readdirSync('./locales/')
  .map((f) => `./locales/${f}`)
  .filter((f) => exts.some((ext) => f.includes(ext)))

export default {
  input: locales,
  output: [
    {
      dir: 'public/dist/locales/es',
      format: 'es',
    },
    {
      dir: 'public/dist/locales/web',
      format: 'es',
    },
  ],
  plugins: [
    {
      name: 'yaml2js',
      transform(content) {
        const js = YAML.load(content)
        const json = JSON.stringify(JSON.stringify(js))
        return {
          code: `export default ${json}`,
          map: { mappings: '' },
        }
      },
      generateBundle(opts, bundle) {
        const ob = []
        const od = []
        for (const [key, entry] of Object.entries(bundle)) {
          let payload = entry.code
            .substring(
              entry.code.indexOf('"{') + 1,
              entry.code.indexOf('}"') + 1,
            )
            .replace(/\\"/g, '"')
          let code = ''
          // Browser
          if (opts.dir.includes('/locales/web'))
            code = `
              window.__owntrack_locales = (window.__owntrack_locales || {}).${entry.name} = ${payload};
            `.trim()
          // ESM
          else if (opts.dir.includes('/locales/es'))
            code = `export default ${payload};`
          od.push(key)
          ob.push({
            type: 'asset',
            fileName: `${entry.name}.js`,
            source: code,
          })
        }
        for (const o of od) delete bundle[o]
        for (const o of ob) this.emitFile(o)
      },
    },
  ],
}
