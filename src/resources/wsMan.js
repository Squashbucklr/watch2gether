import config from '../config.json';

let ws = null;
let silentpingpong = false;

let onConnect = () => {};
let onDisconnect = () => {};
let onConnections = () => {};
let onChat = () => {};
let onSeek = () => {};
let onPlay = () => {};
let onUrl = () => {};
let onElevated = () => {};

const wsMan = {
    onConnect: (fun) => {onConnect = fun},
    onDisconnect: (fun) => {onDisconnect = fun},
    onConnections: (fun) => {onConnections = fun},
    onChat: (fun) => {onChat = fun},
    onSeek: (fun) => {onSeek = fun},
    onPlay: (fun) => {onPlay = fun},
    onUrl: (fun) => {onUrl = fun},
    onElevated: (fun) => {onElevated = fun},
    disconnect: () => {
        if(ws) ws.close();
        else onDisconnect();
    },
    init: (lobby_id) => {
        console.log('init');
        ws = new WebSocket('wss://' + config.base + '/lobby?id=' + lobby_id);
        ws.onopen = () => {
            pingLoop();
            onConnect();
        };
        ws.onmessage = (msg) => {
            console.log(msg.data);
            let data = JSON.parse(msg.data);
            switch(data.type) {
                case 'pong':
                    if (!silentpingpong) console.log('...pong');
                    break;
                case 'invalid':
                    console.log('Invalid lobby id');
                    alert("The lobby id is invalid. Please make a new lobby.");
                    onDisconnect();
                    break;
                case 'connections':
                    onConnections(data.connections, data.host);
                    break; 
                case 'video':
                    onUrl(data.video.url);
                    onSeek(data.video.time);
                    onPlay(data.video.play);
                    break;
                case 'message':
                    onChat(data.from, data.message)
                    break;
                case 'elevated':
                    onElevated(data.elevated);
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
    }
}

export default wsMan;

function pingLoop() {
    if (ws == null) return;
    ws.send(JSON.stringify({
        type: 'ping' 
    })); 
    if (!silentpingpong) console.log('ping...');
    setTimeout(pingLoop, 15000);                    
}