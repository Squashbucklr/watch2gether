import React from 'react';

import './UserList.scss';

class UserList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }


    render() {
        let list = [];
        let connectionkeys = Object.keys(this.props.connections);
        for (let i = 0; i < connectionkeys.length; i++) {
            let indicator = null;
            let mpvcontrol = null;
            if (this.props.connections[connectionkeys[i]].host) {
                indicator =
                    <span
                        className="UserList-indicator-host"
                    >
                        {' (host)'}
                    </span>
            }
            if (this.props.connections[connectionkeys[i]].mpv) {
                indicator =
                    <span
                        className="UserList-indicator-mpv"
                    >
                        {' (mpv-w2g)'}
                    </span>
                if (this.props.connections[connectionkeys[i]].mpvctrl) {
                    mpvcontrol = 
                        <span
                            className="UserList-mpvctrl"
                        >
                            {'> '}
                        </span>
                }
            }
            list.push(
                <div
                    key={'uli' + i}
                    className={'UserList-entry' + (this.props.connectionid == connectionkeys[i] ? ' UserList-me' : '')}
                    onClick={() => {
                        if (this.props.host) {
                            this.props.userClick(connectionkeys[i]);
                        }
                    }}
                >
                    {mpvcontrol}
                    {this.props.connections[connectionkeys[i]].username}
                    {indicator}
                </div>
            );
        }
        return (
            <div className={"UserList" + (this.props.host ? ' UserList-host' : '')}>
                {list}
            </div>
        );
    }
}

export default UserList;
