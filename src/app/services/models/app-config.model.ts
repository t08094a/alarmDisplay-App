export interface IAppConfig {
    applicationTitle: string;
    googleMapsKey: string;
    googleCalendarId: string;
    navigation: {
        startPoint: {
            lat: number;
            lng: number;
        };
    };
    dataserver: {
        url: string;
        port: number;
        restResources: {
            currentAlarmInfo: string;
        };
        websocket: {
            alarmInfoEventKey: string;
        };
    };
}
