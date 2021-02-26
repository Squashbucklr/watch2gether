import React from 'react';

import './Chat.scss';

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.chatInput = React.createRef();
        this.state = {
            
        }
    }

    sendChat = () => {
        let message = this.chatInput.current.value;
        this.props.sendChat(message);
        this.chatInput.current.value = "";
    }

    enterKey = (fun) => {
        return (event) => {
            if (event.which === 13) {
                fun();
            }
        }
    }

    render() {
        let chats = [];

        for (let i = 0; i < this.props.chats.length; i++) {
            chats.push(
                <div key={'c' + i} className="Chat-chat-outer">
                    <div className="Chat-from">{this.props.chats[i].from}:</div>
                    <div className="Chat-chat">{this.props.chats[i].chat}</div>
                </div>
            );
        }

        console.log(chats);

        return (
            <div className="Chat">
                <div className="Chat-box">
                    {chats}
                </div>
                <div className="Chat-bar">
                    <input onKeyDown={this.enterKey(this.sendChat)} ref={this.chatInput}></input>
                    <button onClick={this.sendChat}>Send</button>
                </div>
            </div>
        );
    }
}

export default Chat;
