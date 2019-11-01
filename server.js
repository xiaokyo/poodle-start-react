const path = require("path")
const chalk = require('chalk')
const log = console.log
const successLog = (val) => chalk.bgGreen.black(` ${val} `)
const errLog = (val) => chalk.bgRed(` ${val} `)
const blueLog = (val) => log(chalk.blue(val))
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')// 友好输出webpack插件

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

function useServer(rootPath = '', mode = 'development') {
  log(`${successLog('WAITING')} starting webpack bundle......`)
  const getWebpack = require('./webpack/client.js')
  const common = require('./webpack/common')

  const isDev = mode === 'development' ? true : false
  const appEntry = [`${rootPath}/src/client/index.js`]
  const dirOut = `${rootPath}/dist/assets`
  const plugins = []

  //alias
  let alias = {}
  for (const i in common.alias) {
    alias[i] = rootPath + common.alias[i]
  }

  if (isDev) {
    appEntry.unshift("webpack-hot-middleware/client?noInfo=true&reload=true")
    plugins.push(new webpack.HotModuleReplacementPlugin())
    plugins.push(new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: [`You application is running here http://localhost:${PORT}`],
        notes: ['development environment']
      }
    }))
  }

  const webpackConfig = getWebpack({
    mode,
    alias,
    dirOut,
    plugins,
    index: appEntry,
  })

  const compiler = webpack(webpackConfig)
  if (!isDev) return compiler.run((err, stats) => {// 生产环境
    if (err) {
      log(`${errLog('ERROR')} ${err}`);
      return;
    }

    const info = stats.toJson()
    const { chunks } = info

    log()
    log(' files size')
    log()
    chunks.forEach(item => {
      const { files } = item
      files.forEach(_ => {
        blueLog(`    ${_}  ${(item.size / 1024).toFixed(2)} KB`)
      })
    })
    log()

    log(`${successLog('DONE')} webpack build success`)
  })

  // 测试服务启动
  const devMiddleware = require('webpack-dev-middleware')(compiler, {
    // webpack-dev-middleware options
    publicPath: webpackConfig.output.publicPath,
    index: 'index.html',
    logLevel: 'silent',// 静默日志
  })

  app.use(devMiddleware)

  app.use(require("webpack-hot-middleware")(compiler))// hmr
  app.use(express.static(path.join(__dirname, "dist")))
  app.listen(PORT)
}

module.exports = { useServer }