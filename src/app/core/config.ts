export interface SideMenuItem {
  txt: string;
  icon: string;
  className: string;
  actived: boolean;
}

const siderMenus: SideMenuItem[] = [
  {
    txt: '人物信息',
    actived: false,
    icon: 'user',
    className: 'user-info'
  },
  {
    txt: '历史信息',
    actived: false,
    icon: 'history',
    className: 'history-info'
  }
];

const chartColorConfig = {
  humen: {
    bg: '#00dbff',
    hover: '#0080ff'
  },
  event: {
    bg: '#f4b98c',
    hover: '#ff6700'
  },
  company: {
    bg: '#29abe2',
    hover: '#00dbff'
  },
  point: {
    bg: '#2702bb',
    hover: '#2500ff'
  }
};

const chartOption = {
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

export { siderMenus, chartOption, chartColorConfig };
