const path = require("path")
const chalk = require('chalk')
const log = console.log
const successLog = (val) => chalk.bgGreen.black(` ${val} `)
const errLog = (val) => chalk.bgRed(` ${val} `)
const blueLog = (val) => log(chalk.blue(val))
const webpack = require('webpack')
const nodemon = require('nodemon')
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

function useServer(mode = 'development') {
  log(`${successLog('WAITING')} starting webpack bundle......`)
  const rootPath = process.cwd()
  const getWebpack = require('./webpack/client.js')
  const getServerWebpack = require('./webpack/server.js')
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
    assetPrefix: isDev ? '/' : '//cdn.xiaok.club/',
    plugins,
    index: appEntry,
  })

  const webpackServerConfig = getServerWebpack({
    mode,
    alias,
    dirOut: `${rootPath}/dist/server`,
    index: [`${rootPath}/src/server/index.js`]
  })

  const compiler = webpack([webpackConfig, webpackServerConfig])
  if (!isDev) return webpackBuild(compiler)
  webpackServer({ compiler, webpackConfig })
}

const webpackBuild = (compiler) => {// 生产环境
  compiler.run((err, stats) => {
    if (err) {
      log(`${errLog('ERROR')} ${err}`)
      return
    }

    const info = stats.toJson()
    const { children, errors } = info

    if (stats.hasErrors()) {
      log(`${errLog('ERROR')} ${errors}`)
      return
    }

    children.forEach(item => {
      const { chunks } = item
      bundleLog(chunks)
    })

  })
}

const webpackServer = async ({ compiler, webpackConfig }) => {// 开发服务启动

  const _clientCompiler = compiler.compilers[0]

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    return next()
  });

  app.use(require('webpack-dev-middleware')(_clientCompiler, {// webpack-dev-middleware options
    publicPath: webpackConfig.output.publicPath,
    index: 'index.html',
    logLevel: 'silent',// 静默日志
  }))

  app.use(require("webpack-hot-middleware")(_clientCompiler))// hmr
  app.use(express.static(path.join(__dirname, "dist")))
  app.listen(PORT)
}

const bundleLog = (chunks) => {// 打包成功后输出
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
}

module.exports = { useServer }