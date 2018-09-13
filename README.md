# 智配关系项目说明

> 各模块内有单独的说明

## 布局方式

* 采用rem布局，达到等比例放大缩小效果
* 1rem = 19.8px
* 计算方式[RemService](./src/app/share/services/rem/rem.service.ts)
* 宽度1020以上PC端布局

## 第三方说明

* [ng-zorro-antd](https://ng-zorro.github.io/docs/getting-started/zh): UI库

> 注意：在theme.less中配置了本地的UI字体路径，若UI升级了需注意是否变更并更新路径

* [echarts](http://echarts.baidu.com/): 图表插件

## 项目结构说明，src内

|文件名|说明|
|--|--|
|app|项目源码|
|--core|核心模块，在此扩展核心功能|
|----components|组件|
|----services|服务|
|----config|图表配置|
|--home|首页|
|--share|共享模块，在此扩展全局共享功能|
|----components|组件|
|----pipes|管道|
|----services|服务|
|assets|图片和json|
|environments|环境变量|
|less|基础样式和mixin样式|
|theme.less|UI主题配置|

## 开发说明

* npm install 安装项目依赖
* npm run dev 开启本地开发
* npm start 开启本地开发(修改IP地址为本机IP，则可使手机访问开发微网站，手机与电脑需在同一wifi下)，以当前为例，手机访问192.168.2.113:4444即可
* npm run prod 生产打包
* proxy.conf.json 为本地开发时配置请求代理的文件