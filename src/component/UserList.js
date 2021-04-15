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
            list.push(
                <div
                    key={'uli' + i}
                    className="UserList-entry"
                    onClick={() => {
                        if (this.props.host) {
                            this.props.setHost(connectionkeys[i]);
                        }
                    }}
                >
                    {this.props.connections[connectionkeys[i]].username}
                    {this.props.connections[connectionkeys[i]].host ? <span className="UserList-host">{' (host)'}</span> : ''}
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
