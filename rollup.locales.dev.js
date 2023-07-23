import fs from 'fs'
import YAML from 'js-yaml'

const exts = ['.yml', '.yaml']
const locales = fs
  .readdirSync('./locales/')
  .map((f) => `./locales/${f}`)
  .filter((f) => exts.some((ext) => f.includes(ext)))

export default {
  input: locales,
  output: {
    dir: 'public/dist/locales',
    format: 'es',
  },
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
      generateBundle(_, bundle) {
        const ob = []
        const od = []
        for (const [key, entry] of Object.entries(bundle)) {
          let payload = entry.code
            .substring(
              entry.code.indexOf('"{') + 1,
              entry.code.indexOf('}"') + 1,
            )
            .replace(/\\"/g, '"')
          od.push(key)
          ob.push({
            type: 'asset',
            fileName: `${entry.name}.js`,
            source: `
              window.__owntrack_locales = (window.__owntrack_locales || {}).${entry.name} = ${payload};
            `.trim(),
          })
        }
        for (const o of od) delete bundle[o]
        for (const o of ob) this.emitFile(o)
      },
    },
    // {
    //   name: 'yaml2json',
    //   transform(content) {
    //     const js = YAML.load(content)
    //     const json = JSON.stringify(JSON.stringify(js))
    //     return {
    //       code: `export default ${json};`,
    //       map: { mappings: '' },
    //     }
    //   },
    //   generateBundle(_, bundle) {
    //     const od = []
    //     for (const [key, entry] of Object.entries(bundle)) {
    //       let payload = entry.code
    //         .substring(
    //           entry.code.indexOf('"{') + 1,
    //           entry.code.indexOf('}"') + 1,
    //         )
    //         .replace(/\\"/g, '"')
    //       this.emitFile({
    //         type: 'asset',
    //         fileName: `${entry.name}.json`,
    //         source: payload,
    //       })
    //       od.push(key)
    //     }
    //     for (const o of od) {
    //       delete bundle[o]
    //     }
    //   },
    // },
  ],
}
