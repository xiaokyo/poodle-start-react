#!/usr/bin/env node
const program = require('commander');
const package = require('../package.json')
const { version } = package
const { useServer } = require('../server')

program.version(version)
program
  .command('dev')
  .description('运行开发环境')
  .action(function () {
    useServer()
  })

program
  .command('build')
  .description('打包生产环境')
  .action(function () {
    useServer('production')
  })

program.parse(process.argv);