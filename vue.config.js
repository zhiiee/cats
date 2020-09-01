/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const EnvConfig = require('./env-config.json')

module.exports = {
  css: {
    sourceMap: true
  },
  configureWebpack: config => {
    if (process.env.UNI_PLATFORM === 'mp-weixin') {
      const env = process.env.NODE_ENV === 'development' ? 'dev' : 'build'
      config.plugins.push(new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, './cloudfunctions'),
          to: path.resolve(__dirname, `./dist/${env}/mp-weixin/cloudfunctions`),
          toType: 'dir'
        },
        {
          from: path.resolve(__dirname, './project.config.json'),
          to: path.resolve(__dirname, `./dist/${env}/mp-weixin/project.config.json`),
          toType: 'file'
        }
      ]))
      // 设置一些环境变量
      config.plugins.push(new webpack.DefinePlugin({
        EnvConfig: JSON.stringify(process.env.NODE_ENV === 'development' ? EnvConfig.develop : EnvConfig.release)
      }))
    }
  }
}
