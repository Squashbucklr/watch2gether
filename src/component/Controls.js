import React from 'react';

import './Controls.scss';

class Controls extends React.Component {
    constructor(props) {
        super(props);
        this.usernameInput = React.createRef();
        this.elevateInput = React.createRef();
        this.urlInput = React.createRef();
        this.state = {
            
        }
    }

    componentDidUpdate = () => {
        if (true) {
            this.urlInput.current.value = this.props.video_url;
        }
        this.shouldSetUrl = false;
    }

    setUsername = () => {
        let username = this.usernameInput.current.value;
        this.props.setUsername(username);
        this.usernameInput.current.value = "";
    }

    elevate = () => {
        let username = this.elevateInput.current.value;
        this.props.elevate(username);
        this.elevateInput.current.value = "";
    }

    setUrl = () => {
        let username = this.urlInput.current.value;
        this.props.setUrl(username);
    }

    enterKey = (fun) => {
        return (event) => {
            if (event.which === 13) {
                fun();
            }
        }
    }

    render() {
        return (
            <div className="Controls">
                <div className="Controls-control">
                    <div>lobby: {this.props.lobby_id}</div>
                </div>
                <div className="Controls-control">
                    <input onKeyDown={this.enterKey(this.setUsername)} ref={this.usernameInput}></input>
                    <button onClick={this.setUsername}>Set Username</button>
                </div>
                <div className={"Controls-control" + (!this.props.host ? " Controls-control-hide" : "")}>
                    <input onKeyDown={this.enterKey(this.elevate)} ref={this.elevateInput}></input>
                    <button className={this.props.elevated ? "Controls-green" : ""} onClick={this.elevate}>Elevate</button>
                </div>
                <div className={"Controls-control" + (!this.props.host ? " Controls-control-hide" : "")}>
                    <textarea
                        onKeyDown={this.enterKey(this.setUrl)}
                        ref={this.urlInput}
                    ></textarea>
                    <button onClick={this.setUrl}>Url</button>
                </div>
            </div>
        );
    }
}

export default Controls;
