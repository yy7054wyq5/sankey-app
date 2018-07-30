export interface SideMenuItem {
  txt: string;
  icon: string;
  className: string;
  actived: boolean;
}

const siderMenus: SideMenuItem[] = [{
  txt: '人物信息',
  actived: false,
  icon: 'user',
  className: 'user-info'
}, {
  txt: '历史信息',
  actived: false,
  icon: 'history',
  className: 'history-info'
}];

const chartConfig = {
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [
    {
      type: 'sankey',
      layout: 'none',
      data: [],
      links: [],
      itemStyle: {
        normal: {
          borderWidth: 1,
          borderColor: '#aaa'
        }
      },
      lineStyle: {
        normal: {
          curveness: 0.5
        }
      }
    }
  ]
};

export { siderMenus, chartConfig };
