const { localIdentName } = require('./webpack/common')
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    "@babel/plugin-proposal-class-properties",// 支持类写法
    "@babel/plugin-transform-modules-commonjs",// 支持commonjs的写法
    [
      'react-css-modules',
      {
        autoResolveMultipleImports: true, //允许多个样式文件引入且不需要导出变量引用
        generateScopedName: localIdentName,
        filetypes: {
          '.less': {
            syntax: 'postcss-less',
          },
        },
      },
    ],
  ],
};
