const { localIdentName } = require('./webpack/common')
module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        useBuiltIns: 'entry',
        corejs: 3,
      },
    ],
    require.resolve('@babel/preset-react'),
  ],
  plugins: [
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve("@babel/plugin-proposal-class-properties"),// 支持类写法
    require.resolve("@babel/plugin-transform-modules-commonjs"),// 支持commonjs的写法
    [
      require.resolve('babel-plugin-react-css-modules'),
      {
        context: process.cwd(),
        webpackHotModuleReloading: true,
        autoResolveMultipleImports: true, //允许多个样式文件引入且不需要导出变量引用
        generateScopedName: localIdentName,
        exclude: 'node_modules',
        filetypes: {
          '.less': {
            syntax: 'postcss-less',
          },
        },
      },
    ],
  ],
};
