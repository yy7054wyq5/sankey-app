# 共享模块说明

## components

### [ChartComponent](./components/chart/chart.component.ts): 图表组件

> 单独有个ChartService，以便后期扩展，目前包含类型定义

* 参数说明

|参数|类型|默认值|说明|
|--|--|--|--|
|[ehasFullBtn]|boolean|true|是否有全屏按钮|
|[ewidth]|number|无|图表固定宽度，可以不设|
|[eheight]|number|无|图表固定高度，可以不设|
|[efullParentClassName]|string|无|图标全屏时的父级，全屏功能必须|
|[echeckPoints]|boolean|true|是否启用选择节点功能，就是图表右上的下拉框|
|[eoption]|any|无|图表配置|
|(efullStatus)|boolean|无|图表全屏状态|
|(emouseover)|EventEmitter|无|鼠标经过图表事件回调|
|(eclick)|EventEmitter|无|鼠标点击事件回调|
