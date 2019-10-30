const path = require("path")
const chalk = require('chalk')
const log = console.log
const successLog = (val) => chalk.bgGreen.black(val)
const errLog = (val) => chalk.bgRed(val)
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')// 友好输出webpack插件

// development
const express = require('express')
const app = express()
const PORT = 8080// port
const proxyMiddleWare = require('http-proxy-middleware')
const proxyPath = "http://127.0.0.1:4000"// 目标后端服务地址
const proxyOption = {// proxy options
  target: proxyPath,
  changeOrigoin: true
}

function useServer(rootPath = '', mode = 'development') {
  log(`${successLog('webpack')} starting webpack bundle......`)
  const webpackConfig = require('./webpack/client.js')
  const webpackServerConfig = require('./webpack/server.js')
  const isDev = mode === 'development' ? true : false

  // 修改入口文件，增加热更新文件
  const appEntry = [`${rootPath}/src/client/index.js`]
  let htmlWebpackOptions = {
    initmeta: '<!--meta-->',
    initState: '<!--initState-->',
    filename: 'app.html',
  }
  let publicPath = '//cdn.xiaok.club/'

  if (isDev) {
    appEntry.unshift("webpack-hot-middleware/client?noInfo=true&reload=true")
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
    htmlWebpackOptions = {
      initmeta: '<title>xiaokyo</title>',
      initState: '{}',
      filename: 'index.html',
    }
    publicPath = '/'
  }

  webpackConfig.entry.app = appEntry
  webpackConfig.plugins.push(new HtmlWebpackPlugin({
    ...htmlWebpackOptions,
    template: path.join(__dirname, './public/index.kade'),
  }))
  webpackConfig.plugins.push(new FriendlyErrorsWebpackPlugin({
    compilationSuccessInfo: {
      messages: [`You application is running here http://localhost:${PORT}`],
      notes: ['development environment']
    }
  }))
  webpackConfig.plugins.push(new webpack.DefinePlugin({
    __DEV__: isDev,
    __CLIENT__: true,
  }))
  webpackConfig.mode = mode
  webpackConfig.output.path = `${rootPath}/dist/assets`
  webpackConfig.output.publicPath = publicPath
  webpackConfig.optimization.minimize = false

  // common
  const common = require('./webpack/common')
  //alias
  let alias = {};
  for (const i in common.alias) {
    alias[i] = rootPath + common.alias[i]
  }
  webpackConfig.resolve.alias = alias

  if (!isDev) {
    webpackServerConfig.entry.server = `${rootPath}/src/server/index.js`
    webpackServerConfig.output.path = `${rootPath}/dist/server`
    webpackServerConfig.mode = mode
    webpackServerConfig.resolve.alias = alias
    webpackServerConfig.plugins.push(new webpack.DefinePlugin({
      __DEV__: isDev,
      __CLIENT__: false,
    }))
    webpackServerConfig.plugins.push(new FriendlyErrorsWebpackPlugin())
    webpack(webpackConfig, function () { log(`${successLog('webpack')} client build done`) })
    webpack(webpackServerConfig, function () { log(`${successLog('webpack')} server build done`) })

    return false
  }

  const compiler = webpack(webpackConfig)
  const devMiddleware = require('webpack-dev-middleware')(compiler, {
    // webpack-dev-middleware options
    publicPath: webpackConfig.output.publicPath,
    index: 'index.html',
    logLevel: 'silent',// 静默日志
  })

  app.use(devMiddleware)

  // 设置auth cookie
  app.post('/setAuth', async (req, res) => {
    const access_token = req.headers.accesstoken;
    // console.log(req.headers, access_token);
    res.cookie('access_token', access_token, { path: '/', httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 })
    res.send({ success: true });
  })

  // 清除auth cookie
  app.post('/clearAuth', async (req, res) => {
    res.clearCookie('access_token')
    res.send({ success: true })
  })

  app.use("/graphql", proxyMiddleWare({ ...proxyOption }))
  app.use("/socket.io", proxyMiddleWare({ ...proxyOption, ws: true }))

  app.use(require("webpack-hot-middleware")(compiler))// hmr
  app.use(express.static(path.join(__dirname, "dist")))
  app.listen(PORT)
}

module.exports = { useServer }