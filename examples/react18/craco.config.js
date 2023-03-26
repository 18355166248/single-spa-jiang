module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.output.publicPath = '//localhost:8002/';
      return webpackConfig;
    },
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    const config = devServerConfig;

    config.headers = {
      'Access-Control-Allow-Origin': '*',
    };
    config.historyApiFallback = true;

    config.hot = false;
    config.liveReload = false;

    return config;
  },
};
