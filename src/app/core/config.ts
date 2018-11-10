import { ChartEventCbParams } from '../share/components/chart/chart.service';

const chartColorConfig = {
  person: {
    bg: '#a8cbf4',
    hover: '#0080ff'
  },
  case: {
    bg: '#add8e6',
    hover: '#6495ed'
  },
  organization: {
    bg: '#00dbff',
    hover: '#29abe2'
  },
  point: {
    bg: '#006699',
    hover: '#006699'
  },
  line: '#ececec'
};

const nodesAndLinksInOneLineColor = [
  '#0099C6',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
];

const caseColorConfig = {
  '2': '#483d8b',
  '3': '#00bfff',
  '4': '#4169e1',
  '5': '#b0c4de',
  '6': '#add8e6',
  '7': '#e0ffff'
};

const cutWord = (txt: string) => {
  if (txt.length > 25) {
    return txt.substr(0, 25) + '...';
  }
  return txt;
};

const chartOption = {
  label: {
    formatter: (params: ChartEventCbParams) => {
      // console.log(params);
      // const data = params.data;
      // const name = cutWord(params.name);
      // if (data.date) {
      //   return data.date + '\n' + name;
      // }
      const names = params.name.split(' ');
      if (names.length > 1) {
        return cutWord(names[1]);
      } else {
        return cutWord(params.name);
      }
    }
  },
  tooltip: {
    show: true,
    formatter: param => {
      // console.log(param);
      const data = param.data;

      if (param.dataType === 'edge' && data.cases.length) {
        return data.cases.join('<br>');
      } else {
        if (data.hasOwnProperty('date') && data.hasOwnProperty('name')) {
          return `${data.name}`;
        }
      }

    },
    position: (point, params, dom, rect, size) => {
      // 固定在顶部
      return [point[0], 0];
  }
  },
  series: [
    {
      label: {
        position : 'inside',
        color: '#fff',
        fontSize: 16,
      },
      nodeWidth: 90,
      type: 'sankey',
      layout: 'none',
      data: [],
      links: [],
      right: '5%',
      top: 'top',
      layoutIterations: 0,
      // focusNodeAdjacency: true,
      lineStyle: {
        color: chartColorConfig.line,
        opacity: 0.5
      },
      emphasis: {
        lineStyle: {
          color: chartColorConfig.line,
          opacity: 0.7
        }
      }
    }
  ]
};

export { chartOption, chartColorConfig, caseColorConfig, nodesAndLinksInOneLineColor };
