const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/preload.js',
  target: 'electron-preload',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'preload.js'
  },
  node: {
    __dirname: false,
    __filename: false
  }
};