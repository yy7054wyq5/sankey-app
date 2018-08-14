# 共享模块说明

## components

### [ChartComponent](./components/chart/chart.component.ts): 图表组件

> 单独有个ChartService，以便后期扩展，目前包含类型定义；图表可以依据传入的高宽来设置固定大小，不传入高宽则依据父级的高宽自动布局

* 参数说明

|参数|类型|默认值|说明|
|--|--|--|--|
|[ehasFullBtn]|boolean|true|是否有全屏按钮|
|[ewidth]|number|无|图表固定宽度，可以不设|
|[eheight]|number|无|图表固定高度，可以不设|
|[efullParentClassName]|string|无|图标全屏时的父级，全屏功能必须|
|[eoption]|any|无|图表配置|
|(efullStatus)|boolean|无|图表全屏状态|
|(emouseover)|EventEmitter|无|鼠标经过图表事件回调|
|(eclick)|EventEmitter|无|鼠标点击事件回调|

### [ErrorComponent](./components/error/error.component.ts): 错误页或404页

### [LayoutComponent](./components/layout/layout.component.ts): 项目结构

## pipes

### [SafeHtmlPipe](./pipes/safe-html/safe-html.pipe.ts): 信任html的管道

## services

### [InterceptorsService](./services/interceptors/interceptors.service.ts): 用于拦截请求或相应

### [LoadingService](./services/loading/loading.service.ts): 请求时的全屏遮罩

### [RemService](./services/rem/rem.service.ts): 常用于移动端的布局方案，这里用于PC响应式布局

### [StorageService](./services/storage/storage.service.ts): localStorage的封装

### [UtilsService](./services/utils/utils.service.ts): 工具方法函数集合，暂无