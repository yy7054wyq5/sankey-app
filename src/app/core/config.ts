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


export { siderMenus };
