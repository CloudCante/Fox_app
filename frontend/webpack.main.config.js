const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  externals: {
    electron: 'commonjs2 electron',
    'electron-updater': 'commonjs2 electron-updater',
    'electron-squirrel-startup': 'commonjs2 electron-squirrel-startup'
  },
  plugins:[ new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns:[]})],
  node: {
    __dirname: false,
    __filename: false
  }
};
