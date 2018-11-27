// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    googleMapsKey: 'AIzaSyCxA9zyYW8cK3Ys4HpG_xIP3V3HxQ-3msQ',
    applicationTitle: 'Feuerwehr Alarm Info Display',
    dataserver: {
        url: 'http://alarmdisplay-datacenter',
        port: '9002',
        restApi: {
            currentAlarmInfo: '/current-alarm-info'
        },
        websocket: {
            alarmInfoEventKey: 'ws-alarm-info'
        }
    },
    // e.g. Feuerwehr Gerätehaus
    navigationStartPoint: {
        lat: 49.526558948981595,
        lng: 10.483931601047516
    },
    VERSION: require('../../package.json').version
};
