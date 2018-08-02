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
  person: {
    bg: '#00dbff',
    hover: '#0080ff'
  },
  case: {
    bg: '#f4b98c',
    hover: '#ff6700'
  },
  organization: {
    bg: '#29abe2',
    hover: '#00dbff'
  },
  point: {
    bg: '#2702bb',
    hover: '#2500ff'
  },
  line: '#ececec'
};

const chartOption = {
  // tooltip: {
  //   trigger: 'item',
  //   triggerOn: 'mousemove'
  // },
  legend: {
    formatter: '{name}'
  },
  label: {
    formatter: params => {
      return params.name;
    }
  },
  series: [
    {
      type: 'sankey',
      layout: 'none',
      data: [],
      links: [],
      lineStyle: {
        color: chartColorConfig.line,
        opacity: 0.2
      },
      emphasis: {
        lineStyle: {
          color: chartColorConfig.line,
          opacity: 0.6
        }
      }
    }
  ]
};

export { siderMenus, chartOption, chartColorConfig };
