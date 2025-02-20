const path = require('path');

module.exports = {
  entry: './static/script.js', 
  output: {
    path: path.resolve(__dirname, 'static/dist'), 
    filename: 'bundle.js', 
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], 
          },
        },
      },
    ],
  },
};
