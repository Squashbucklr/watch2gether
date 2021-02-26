import React from 'react';
import videojs from 'video.js';

import './Video.scss';
import 'video.js/dist/video-js.css';

class Video extends React.Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
        this.state = {
            autoplay: true,
            controls: true,
            sources: [{
                src: this.props.video.url,
                type: 'video/mp4'
            }]
        }
    }

    componentDidMount() {
        this.player = videojs(this.videoNode, this.state, function onPlayerReady(){
            console.log('onPlayerReady', this);
        });
    }

    componentWillMount() {
        if (this.player) {
            this.player.dispose();
        }
    }

    render() {
        return (
            <div className="Video">
                <div data-vjs-player>
                    <video ref={ node => this.videoNode = node } className="Video-video video-js">
                    </video>
                </div>
            </div>
        );
    }
}

export default Video;
