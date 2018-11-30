export const environment = {
    production: true,
    googleMapsKey: 'AIzaSyCxA9zyYW8cK3Ys4HpG_xIP3V3HxQ-3msQ',
    applicationTitle: 'Feuerwehr Alarm Info Display',
    dataserver: {
        url: 'http://alarmmonitor-worker',
        port: '9002',
        restApi : {
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
