/* eslint-disable no-undef */
module.exports = {
  // Si la liste à maintenir de polyfill manuelle est trop compliquée:
  // changer usebuiltIns à  'entry' et rajouter un import 'core-js' au fichier main.js
  // pour charger TOUS les polyfill correspondants à package.json#browserslist
  presets: [['@vue/babel-preset-app', { useBuiltIns: 'usage' }]],
  plugins: ['@babel/plugin-proposal-class-properties']
}
