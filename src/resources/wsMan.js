import config from '../config.json';

let ws = null;
let silentpingpong = false;

let onConnect = () => {};
let onDisconnect = () => {};
let onConnections = () => {};
let onChat = () => {};
let onSeek = () => {};
let onPlay = () => {};
let onData = () => {};
let onElevated = () => {};

const wsMan = {
    onConnect: (fun) => {onConnect = fun},
    onDisconnect: (fun) => {onDisconnect = fun},
    onConnections: (fun) => {onConnections = fun},
    onChat: (fun) => {onChat = fun},
    onSeek: (fun) => {onSeek = fun},
    onPlay: (fun) => {onPlay = fun},
    onData: (fun) => {onData = fun},
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
                    onData(data.video.data);
                    onSeek(data.video.time);
                    onPlay(data.video.play);
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
    setData: (data) => {
        if(ws && ws.readyState === 1) ws.send(JSON.stringify({
            type: 'url',
            data
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