const path = require('path');

module.exports = {
  devServer: {
    port: 8000,
  },
  chainWebpack: (config) => {
    config.resolve.alias.set(
      '@single-spa-jiang/esm',
      path.join(__dirname, '../../dist/single-spa-jiang.esm.js'),
    );
    console.log('config.resolve.alias', config.resolve.alias);
  },
};
