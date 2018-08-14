# 核心模块说明

## components

### [CoreMainComponent](./components/core-main/core-main.component.ts): 容器组件，帮助各组件之间的交互

### [SearchBarComponent](./components/search-bar/search-bar.component.ts): 搜索组件

> 内部拥有Record类，用于记录历史消息；侧栏的历史消息的交互完全依靠这个Record；内部有各种类型声明；

* 参数说明

|参数|默认值|说明|
|--|--|--|
|[searchDelaytTime]|500|单位ms，每次搜索延迟时间|
|(outSearchResult)|无|返回搜索结果，类型定义SearchResult|
|(outSearchStatus)|无|返回搜索状态，类型定义SearchStatus|
|(outSearchSuccessRecords)|无|返回成功搜索的记录，暂未使用这个回调|

### [SiderComponent](./components/sider/sider.component.ts): 侧栏组件

* 参数说明

|参数|默认值|说明|
|--|--|--|
|[searchBar]|无|SearchBarComponent|
|[person]|[]|人物信息数据，使用setter比较方便的接收数据|
|[histories]|[]|历史记录，使用setter比较方便的接收数据|

### [CheckNodeComponent](./components/check-node/check-node.component.ts)

> 在页面中，实际上是将该组件置于图表组件中；默认的将该组件绝对定位于图表组件中，所以需要设置top和right值

|参数|类型|默认值|说明|
|--|--|--|--|
|[top]|number|无|单位rem|
|[right]|number|无|单位rem|
|[nodes]|ChartNode[]|[]|图表所有节点集合，只是带上了是否可以隐藏的tag|
|(outCheckedNodes)|EventEmitter<ChartNode[]>|无|去掉隐藏后的节点集合|

## services

### [CommonService](./services/common/common.service.ts): 内部含有核心方法