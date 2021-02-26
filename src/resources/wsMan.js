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

const wsMan = {
    onConnect: (fun) => {onConnect = fun},
    onDisconnect: (fun) => {onDisconnect = fun},
    onConnections: (fun) => {onConnections = fun},
    onChat: (fun) => {onChat = fun},
    onSeek: (fun) => {onSeek = fun},
    onPlay: (fun) => {onPlay = fun},
    onUrl: (fun) => {onUrl = fun},
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
                default:
                    console.log(data);
                    break;
            }
        };
    },
    seek: (time) => {
        ws.send(JSON.stringify({
            type: 'time',
            time
        }));
    },
    play: (play, time) => {
        ws.send(JSON.stringify({
            type: 'play',
            play,
            time
        }));
    },
    elevate: (code) => {
        ws.send(JSON.stringify({
            type: 'elevate',
            code
        }));
    },
    setUrl: (url) => {
        ws.send(JSON.stringify({
            type: 'url',
            url
        }));
    },
    setUsername: (name) => {
        ws.send(JSON.stringify({
            type: 'name',
            name
        }));
    },
    sendChat: (message) => {
        ws.send(JSON.stringify({
            type: 'message',
            message
        }));
    },
    setHost: (connectionid) => {
        console.log(connectionid);
        ws.send(JSON.stringify({
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