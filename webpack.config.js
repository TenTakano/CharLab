const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_env, argv) => {
  const common = {
    mode: argv.mode,
    resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: { transpileOnly: true }
          },
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: { importLoaders: 1 }
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource'
        }
      ]
    },
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
      entry: {
        renderer: './src/renderer/index.tsx',
      },
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
    }
  ];
}
