export interface SideMenuItem {
  txt: string;
  icon: string;
  actived: boolean;
}

const siderMenus: SideMenuItem[] = [{
  txt: '人物信息',
  actived: false,
  icon: 'anticon-user',
}, {
  txt: '历史信息',
  actived: false,
  icon: 'anticon-clock-circle-o',
}];

const chartConfig = {
  title: {
    text: 'Sankey Diagram'
  },
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
