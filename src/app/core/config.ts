import { ChartOption, ChartEventCbParams } from '../share/components/chart/chart.service';

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
    bg: '#00dbff',
    hover: '#29abe2'
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

export { chartOption, chartColorConfig };
