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
      let name = '';
      const names = params.name.split('<br>');
      if (names.length > 1) {
        name = names[0] + '\n' + cutWord(names[1]);
      } else {
        name = cutWord(params.name);
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
      right: '5%',
      top: 'top',
      layoutIterations: 0,
      focusNodeAdjacency: true,
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

export { chartOption, chartColorConfig, caseColorConfig };
