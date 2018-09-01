import { ChartEventCbParams } from '../share/components/chart/chart.service';

const chartColorConfig = {
  person: {
    bg: '#a8cbf4',
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

const cutWord = (txt: string) => {
  if (txt.length > 6) {
    return txt.substr(0, 6) + '...';
  }
  return txt;
};

const chartOption = {
  label: {
    formatter: (params: ChartEventCbParams) => {
      // console.log(params);
      const data = params.data;
      const name = cutWord(params.name);
      if (data.date) {
        return data.date + '\n' + name;
      }
      return name;
    }
  },
  tooltip: {
    show: true,
    formatter: param => {
      const data = param.data;
      if (data.hasOwnProperty('date') && data.hasOwnProperty('name')) {
        return `${data.name}`;
      }
    }
  },
  series: [
    {
      type: 'sankey',
      layout: 'none',
      data: [],
      links: [],
      layoutIterations: 0,
      focusNodeAdjacency: 'allEdges',
      lineStyle: {
        color: chartColorConfig.line,
        opacity: 0.6
      },
      emphasis: {
        lineStyle: {
          color: chartColorConfig.line,
          opacity: 0.8
        }
      }
    }
  ]
};

export { chartOption, chartColorConfig };
