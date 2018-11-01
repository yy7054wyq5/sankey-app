// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  requestDelayTime: 500,
  apiHost: '',
  // apiHost: 'http://10.0.2.12:10130/',
  // apiHost: 'http://10.0.15.166:10130/',
  // apiHost: 'http://10.0.15.189:10130/',
  useRelationJson: false
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
