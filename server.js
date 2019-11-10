const fs = require('fs')
const path = require("path")
const chalk = require('chalk')
const log = console.log
const successLog = (val) => chalk.bgGreen.black(` ${val} `)
const errLog = (val) => chalk.bgRed(` ${val} `)
const blueLog = (val) => log(chalk.blue(val))
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')// 友好输出webpack插件

const webpackDevServer = require('webpack-dev-middleware')
const webpackHot = require('webpack-hot-middleware')

// development
const express = require('express')
const app = express()
const PORT = 8080// port
// const proxyMiddleWare = require('http-proxy-middleware')
// const proxyPath = "http://127.0.0.1:4000"// 目标后端服务地址
// const proxyOption = {// proxy options
//   target: proxyPath,
//   changeOrigoin: true
// }

const rootPath = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(rootPath, relativePath);
function useServer(mode = 'development') {
  log(`${successLog('WAITING')} starting webpack bundle......`)
  const getWebpack = require('./webpack/client.js')
  const common = require('./webpack/common')

  const isDev = mode === 'development' ? true : false
  const appEntry = [resolveApp(`src/client/index.js`)]

  console.log(resolveApp(`src/client/index.js`))
  const dirOut = resolveApp(`dist/assets`)
  const plugins = []

  //alias
  let alias = {}
  for (const i in common.alias) {
    alias[i] = rootPath + common.alias[i]
  }

  // appEntry.unshift('webpack-hot-middleware/client?noInfo=true&reload=true')
  plugins.push(new webpack.HotModuleReplacementPlugin())
  plugins.push(new FriendlyErrorsWebpackPlugin({
    compilationSuccessInfo: {
      messages: [`You application is running here http://localhost:${PORT}`],
      notes: ['development environment']
    }
  }))

  const webpackConfig = getWebpack({
    mode,
    alias,
    dirOut,
    assetPrefix: isDev ? '/' : '//cdn.xiaok.club/',
    plugins,
    index: appEntry,
  })

  const compiler = webpack(webpackConfig)

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    return next()
  });

  // app.use(webpackHot(compiler))// hmr

  app.use(webpackDevServer(compiler, {// webpack-dev-middleware options
    publicPath: webpackConfig.output.publicPath,
    index: 'index.html',
    logLevel: 'silent',// 静默日志
  }))

  app.use(express.static(path.join(__dirname, "dist")))
  app.listen(PORT)
}



module.exports = { useServer }