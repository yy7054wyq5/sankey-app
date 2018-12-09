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

const nodesAndLinksInOneLineColor = ['#0099C6', '#DC3912', '#FF9900', '#109618', '#990099'];

const personDetailApi = '/api/web/AiGuanXiDetail/getPersonDetail';
const companyDetailApi = '/api/web/AiGuanXiDetail/getCompanyDetail';
const eventHasPersonApi = '/api/web/AiGuanXiDetail/getEventDetail';

const searchPersonApi = '/api/web/Extract/extractNew';
const searchCompanyApi = '/api/web/Extract/extractCompany';
const searchPersonRelationApi = '/api/web/Relation/aiGuanXiRelation';
const searchCompanyRelationApi = '/api/web/Relation/aiGuanXiCompanyRelation';
const searchPointApi = '/api/web/Relation/aiGuanXiSelfRelation';

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
        const case_name = [];
        data.cases.forEach((item, index) => {
          const obj = JSON.parse(item);
          // console.log(obj);
          case_name.push(obj.case_name);
        });
        return case_name.join('<br>');
      } else {
        if (data.hasOwnProperty('date') && data.hasOwnProperty('name')) {
          return data.name.split(' ').reverse().join(' ');
        }
      }
    },
    position: function(point, params, dom, rect, size) {
      // point: 鼠标位置，如 [20, 40]。
      // params: 同 formatter 的参数相同。
      // dom: tooltip 的 dom 对象。
      // rect: 只有鼠标在图形上时有效，是一个用x, y, width, height四个属性表达的图形包围盒。
      // size: 包括 dom 的尺寸和 echarts 容器的当前尺寸，例如：{contentSize: [width, height], viewSize: [width, height]}
      return [point[0], point[1]];
    }
  },
  series: [
    {
      draggable: false,
      label: {
        position: 'inside',
        color: '#fff',
        fontSize: 16
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

export { chartOption, chartColorConfig, caseColorConfig, nodesAndLinksInOneLineColor, personDetailApi, eventHasPersonApi, companyDetailApi, searchPersonApi, searchPointApi, searchPersonRelationApi, searchCompanyApi, searchCompanyRelationApi };
