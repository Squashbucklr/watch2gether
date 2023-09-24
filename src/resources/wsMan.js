import config from '../config.json';

let ws = null;
let pingpongtimeout = null;

let onConnect = () => {};
let onDisconnect = () => {};
let onConnections = () => {};
let onChat = () => {};
let onVideo = () => {};
let onElevated = () => {};

const wsMan = {
    onConnect: (fun) => {onConnect = fun},
    onDisconnect: (fun) => {onDisconnect = fun},
    onConnections: (fun) => {onConnections = fun},
    onChat: (fun) => {onChat = fun},
    onVideo: (fun) => {onVideo = fun},
    onElevated: (fun) => {onElevated = fun},
    disconnect: () => {
        if(ws) ws.close();
        else onDisconnect();
    },
    init: (lobby_id) => {
        console.log('Initializing WebSocket connection...');
        ws = new WebSocket('wss://' + config.base + '/lobby?id=' + lobby_id);
        ws.onopen = () => {
            onConnect();
            pingLoop();
        };
        ws.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            switch(data.type) {
                case 'pong':
                    clearTimeout(pingpongtimeout);
                    break;
                case 'invalid':
                    console.log('Invalid lobby id');
                    alert("The lobby id is invalid. Please make a new lobby.");
                    onDisconnect();
                    break;
                case 'connections':
                    onConnections(data.connections, data.host, data.connectionid);
                    break; 
                case 'video':
                    onVideo(data.video.url, data.video.time, data.video.play);
                    break;
                case 'message':
                    onChat(data.from, data.message)
                    break;
                case 'elevated':
                    onElevated(data.elevated);
                    break;
                default:
                    console.log(data);
                    break;
            }
        };
        ws.onclose = () => {
            ws = null;
            onDisconnect();
        }
    },
    seek: (time) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'time',
            time
        }));
    },
    play: (play, time) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'play',
            play,
            time
        }));
    },
    elevate: (code) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'elevate',
            code
        }));
    },
    mpv: (command) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'mpv',
            command
        }));
    },
    setUrl: (url) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'url',
            url
        }));
    },
    setUsername: (name) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'name',
            name
        }));
    },
    sendChat: (message) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'message',
            message
        }));
    },
    setHost: (connectionid) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'host',
            connectionid
        }));
    },
    setMpvControl: (connectionid) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'mpvctrl',
            connectionid
        }));
    }
}

export default wsMan;

function pingLoop() {
    if (ws == null) return;
    ws.send(JSON.stringify({
        type: 'ping' 
    })); 
    clearTimeout(pingpongtimeout);
    pingpongtimeout = setTimeout(() => {
        console.log('didn\'t receive pong within 5 seconds...');
    }, 5000);
    setTimeout(pingLoop, 15000);                    
}
