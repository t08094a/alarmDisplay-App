export const environment = {
    production: true,
    googleMapsKey: 'AIzaSyCxA9zyYW8cK3Ys4HpG_xIP3V3HxQ-3msQ',
    applicationTitle: 'Feuerwehr Alarm Info Display',
    dataserver: {
        url: 'http://localhost',
        port: '9001',
        restApi : {
            currentAlarmInfo: '/current-alarm-info'
        },
        websocket: {
            alarmInfoEventKey: 'alarm-info'
        }
    },
    VERSION: require('../../package.json').version
};
