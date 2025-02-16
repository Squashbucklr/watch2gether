import React from 'react';

import './Controls.scss';

class Controls extends React.Component {
    constructor(props) {
        super(props);
        this.usernameInput = React.createRef();
        this.elevateInput = React.createRef();
        this.urlInput = React.createRef();
        this.needsUrlChange = false;
        this.state = {
            
        }
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        this.needsUrlChange =
            this.props.video_url !== nextProps.video_url ||
            this.props.host !== nextProps.host;
        return true;
    }

    componentDidUpdate = () => {
        if (this.needsUrlChange && (this.urlInput && this.urlInput.current)) {
            this.urlInput.current.value = this.props.video_url;
        }
    }

    setUsername = () => {
        let username = this.usernameInput.current.value;
        this.props.setUsername(username);
        this.usernameInput.current.value = "";
    }

    elevate = () => {
        let key = this.elevateInput.current.value;
        this.props.elevate(key);
        this.elevateInput.current.value = "";
    }

    sap = () => {
        let key = this.elevateInput.current.value;
        this.props.sap(key);
        this.elevateInput.current.value = "";
    }

    setUrl = () => {
        let username = this.urlInput.current.value;
        this.props.setUrl(username);
    }

    mpv = (command) => {
        return () => {
            this.props.mpv(command);
        }
    }

    enterKey = (fun) => {
        return (event) => {
            if (event.which === 13) {
                fun();
            }
        }
    }

    render() {
        let mpvW2gButton = null;
        let hideButton = <button className="Controls-hideButton" onClick={this.props.toggleHideSidebar}>
            {this.props.hideSidebar ? "\u21A2" : "\u21A3"}
        </button>;

        if (this.props.launchMpvW2g) {
            mpvW2gButton = (
                <button onClick={() => this.props.launchMpvW2g("mpv-w2g user")}>mpv</button>
            );
        }

        if (this.props.hideSidebar) {
            return (
                <div className="Controls">
                    <div className="Controls-control Controls-justbutton">
                        {hideButton}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="Controls">
                    <div className="Controls-control">
                        {hideButton}
                        <div>lobby: {this.props.lobby_id}</div>
                    </div>
                    <div className="Controls-control">
                        <input onKeyDown={this.enterKey(this.setUsername)} ref={this.usernameInput}></input>
                        <button onClick={this.setUsername}>Uname</button>
                        <button onClick={this.props.toggleFakeVideo}>{this.props.fakeVideo ? "Fake" : "Video"}</button>
                        {mpvW2gButton}
                    </div>
                    <div className={"Controls-control" + (!this.props.host ? " Controls-control-hide" : "")}>
                        <input type="password" onKeyDown={this.enterKey(this.elevate)} ref={this.elevateInput}></input>
                        <button className={this.props.elevated ? "Controls-green" : ""} onClick={this.elevate}>Elevate</button>
                        <button className={this.props.sapped ? "Controls-green" : ""} onClick={this.sap}>Sap</button>
                    </div>
                    <div className={"Controls-control Controls-buttons" + (!this.props.host || !this.props.hasmpv ? " Controls-control-hide" : "")}>
                        <button onClick={this.mpv('display')}>Display</button>
                        <button onClick={this.mpv('subcycle')}>Subs</button>
                        <button onClick={this.mpv('audiocycle')}>Audio</button>
                        <button onClick={this.mpv('voldown')}>Vol -</button>
                        <button onClick={this.mpv('volup')}>Vol +</button>
                    </div>
                    <div className={"Controls-control Controls-buttons" + (!this.props.host || !this.props.hasmpv ? " Controls-control-hide" : "")}>
                        <button onClick={this.mpv('subdelaydown')}>SD -</button>
                        <button onClick={this.mpv('subdelayup')}>SD +</button>
                        <button onClick={this.mpv('audiodelaydown')}>AD -</button>
                        <button onClick={this.mpv('audiodelayup')}>AD +</button>
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
}

export default Controls;
