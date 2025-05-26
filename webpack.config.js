const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv) => {
  const common = {
    mode: argv.mode,
    resolve: { extensions: ['.ts', '.js'] },
    module: { rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }] },
    devtool: argv.mode === 'development' ? 'source-map' : false,
  };

  return [
    {
      ...common,
      name: 'main',
      entry: {
        main: './src/main/main.ts',
        preload: './src/preload/preload.ts',
      },
      target: 'electron-main',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
      },
    },
    {
      ...common,
      name: 'renderer',
      entry: { renderer: './src/renderer/renderer.ts' },
      target: 'electron-renderer',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: './src/renderer/index.html',
          filename: 'index.html',
          chunks: ['renderer'],
        })
      ],
      module: {
        rules: [
          ...common.module.rules,
          { test: /\.(png|jpe?g|gif|svg)$/, type: 'asset/resource' },
        ]
      }
    }
  ];
}
