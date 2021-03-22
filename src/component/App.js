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
            video_data: "",
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
            chats.push({from, chat});
            this.setState({chats});
        });
        wsMan.onSeek((video_time) => {
            this.setState({video_time});
        });
        wsMan.onPlay((video_play) => {
            this.setState({video_play});
        });
        wsMan.onData((video_data) => {
            this.setState({video_data});
        });
        wsMan.onElevated((elevated) => {
            this.setState({elevated});
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
                            data={this.state.video_data}
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
                            setData={wsMan.setData}
                            lobby_id={this.state.lobby_id}
                            video_data={this.state.video_data}
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
