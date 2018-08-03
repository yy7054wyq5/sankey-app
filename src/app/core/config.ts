import { ChartOption, ChartEventCbParams } from '../share/components/chart/chart.service';

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

const chartOption: ChartOption = {
  // tooltip: {
  //   trigger: 'item',
  //   triggerOn: 'mousemove'
  // },
  label: {
    formatter: (params: ChartEventCbParams) => {
      const data = params.data;
      const cutWord = (txt: string) => {
        if (txt.length > 6) {
          return txt.substr(0, 6) + '...';
        }
        return txt;
      };
      const name = cutWord(data.name);
      if (data.date) {
        return data.date + '\n' + name;
      }
      return name;
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
