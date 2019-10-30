#!/usr/bin/env node
const program = require('commander');
const package = require('../package.json')
const { version } = package
const { useServer } = require('../server')

program.version(version)
const rootPath = process.cwd() // 命令运行的根目录
program
  .command('dev')
  .description('运行开发环境')
  .action(function () {
    useServer(rootPath)
  })

program
  .command('build')
  .description('打包生产环境')
  .action(function () {
    useServer(rootPath, 'production')
  })

program.parse(process.argv);