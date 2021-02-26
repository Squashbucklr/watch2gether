import React from 'react';
import qs from 'qs';

import Video from './Video';
import Controls from './Controls';
import Chat from './Chat';
import UserList from './UserList';

import wsMan from '../resources/wsMan';

import './App.scss';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            video_url: "",
            video_play: false,
            video_time: 0,
            lobby_id: qs.parse(window.location.search, { ignoreQueryPrefix: true }).id,
            chats: [],
            connections: {},
            host: false,
            elevated: false 
        }
    }

    componentWillUnmount = () => {
        wsMan.disconnect();
    }

    init = () => {
        wsMan.onConnect(() => {
            console.log('connected');
            this.setState({connected: true});
        });
        wsMan.onDisconnect(() => {
            console.log('disconnected');
            this.setState({connected: false});
        });
        wsMan.onConnections((connections, host) => {
            this.setState({connections, host});
        });
        wsMan.onChat((from, chat) => {
            let chats = [...this.state.chats];
            console.log(chats);
            chats.push({from, chat});
            console.log(chats);
            this.setState({chats});
        });
        wsMan.onSeek((video_time) => {
            this.setState({video_time});
        });
        wsMan.onPlay((video_play) => {
            this.setState({video_play});
        });
        wsMan.onUrl((video_url) => {
            this.setState({video_url});
        });
        wsMan.onElevated(() => {
            this.setState({elevated: true});
        });

        wsMan.init(this.state.lobby_id);
    }

    playPause = (time) => {
        wsMan.play(!this.state.video_play, time);
    }

    elevate = (code) => {
        this.setState({elevated: false});
        wsMan.elevate(code);
    }

    render() {
        if (this.state.connected) {
            return (
                <div className="App">
                    <div className="App-left">
                        <Video
                            url={this.state.video_url}
                            play={this.state.video_play}
                            time={this.state.video_time}
                            playPause={this.playPause}
                            seek={wsMan.seek}
                        />
                    </div>
                    <div className="App-right">
                        <Controls
                            setUsername={wsMan.setUsername}
                            elevate={this.elevate}
                            setUrl={wsMan.setUrl}
                            video_url={this.state.video_url}
                            host={this.state.host}
                            elevated={this.state.elevated}
                        />
                        <UserList
                            connections={this.state.connections}
                            host={this.state.host}
                            setHost={wsMan.setHost}
                        />
                        <Chat
                            chats={this.state.chats}
                            sendChat={wsMan.sendChat}
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <button
                    className="join"
                    onClick={this.init}
                >Join</button>
            );
        }
    }
}

export default App;
