import React from 'react';

import './Video.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPlay,
    faPause,
    faVolumeMute,
    faVolumeUp,
    faVolumeDown,
    faExpand,
    faCompress
} from '@fortawesome/free-solid-svg-icons'

const OFFSET_TOLERANCE = 0.75;

class Video extends React.Component {
    constructor(props) {
        super(props);
        this.needsTimeChange = true;
        this.needsSourceLoad = false;
        this.mouseTimeout = null;
        this.videoNode = React.createRef();
        this.videoWrapper = React.createRef();
        this.videoScrubber = React.createRef();
        this.state = {
            seeking: false,
            hover_scrubber: false,
            hover_play: false,
            hover_audio: false,
            hover_fulscreen: false,
            video_currentTime: 0,
            video_fullscreen: false,
            hideMouse: true,
            peek: {
                left: 0,
                time: 0
            }
        }
    }

    componentDidMount = () => {
        this.fixVideoPosition();
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        this.needsTimeChange = Math.abs(this.props.time - nextProps.time) > 0.01;
        this.needsSourceLoad = this.props.url !== nextProps.url;
        return true;
    }

    componentDidUpdate = () => {
        if (this.needsSourceLoad) this.videoNode.current.load();
        if (this.needsTimeChange) this.fixVideoPosition();
        if (this.videoNode.current.paused && this.props.play) {
            this.videoNode.current.play();
        } else if (!this.videoNode.current.paused && !this.props.play) {
            this.videoNode.current.pause();
        }
    }

    fixVideoPosition = () => {
        this.needsScrub = false;
        if (!this.props.play || Math.abs(this.getCurrentTime() - this.props.time) > OFFSET_TOLERANCE) {
            // important to note that this.props.time only changes when the websocket passes the video state.
            // it does not live update.
            this.videoNode.current.currentTime = this.props.time;
        }
    }

    scrubberPeek = (e) => {
        let scrubBox = this.videoScrubber.current.getBoundingClientRect();
        let scrubThru = ((e.pageX - scrubBox.x) / scrubBox.width);
        if (scrubThru <= 0) scrubThru = 0;
        if (scrubThru >= 1) scrubThru = 1;
        this.scrubFrac(scrubThru);
        
    }

    scrubFrac = (frac) => {
        this.setState({
            peek: {
                left: (frac * 100) + '%',
                time: frac * this.getDuration()
            }
        });
    }

    mouseHide = (time) => {
        return (e) => {
            clearTimeout(this.mouseTimeout);
            this.setState({hideMouse: false});
            this.mouseTimeout = setTimeout(() => {
                if(
                    !this.state.hover_scrubber && 
                    !this.state.hover_play &&
                    !this.state.hover_audio &&
                    !this.state.hover_fulscreen
                ) {
                    this.setState({hideMouse: true});
                }
            }, time);
        }
    }

    getTime = (input) => {
        let seconds = Math.floor(input);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        seconds = seconds % 60;
        minutes = minutes % 60;
        if(minutes < 10) minutes = "0" + minutes;
        if(seconds < 10) seconds = "0" + seconds;
        return (hours > 0 ? hours + ":" : "") + minutes + ":" + seconds;
    }

    doSeek = () => {
        if(this.state.seeking) {
            this.props.seek(this.state.peek.time);
        }
        this.setState({seeking: false});
    }

    getCurrentTime = () => {
        return this.videoNode ? this.videoNode.current ? this.videoNode.current.currentTime : 0 : 0;
    }

    getDuration = () => {
        return this.videoNode ? this.videoNode.current ? this.videoNode.current.duration : 0 : 0;
    }

    isFullScreen = () => {
        return !!(
            document.fullscreen ||
            document.webkitIsFullScreen ||
            document.mozFullScreen ||
            document.msFullscreenElement ||
            document.fullscreenElement
        );
     }

    handleFullscreen = () => {
        if (this.isFullScreen()) {
           if (document.exitFullscreen) document.exitFullscreen();
           else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
           else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
           else if (document.msExitFullscreen) document.msExitFullscreen();
        }
        else {
           if (this.videoWrapper.current.requestFullscreen) this.videoWrapper.current.requestFullscreen();
           else if (this.videoWrapper.current.mozRequestFullScreen) this.videoWrapper.current.mozRequestFullScreen();
           else if (this.videoWrapper.current.webkitRequestFullScreen) this.videoWrapper.current.webkitRequestFullScreen();
           else if (this.videoWrapper.current.msRequestFullscreen) this.videoWrapper.current.msRequestFullscreen();
        }
    }

    render = () => {
        return (
            <div className="Video">
                
                <figure
                    ref={this.videoWrapper}
                    onMouseMove={this.mouseHide(1500)}
                    onMouseOut={this.mouseHide(0)}
                    style={{
                        cursor: this.state.hideMouse ? "none" : "default"
                    }}
                    className={"Video-wrapper" + (this.state.hideMouse ? " Video-hide" : "")}
                >
                    <video
                        ref={this.videoNode}
                        className="Video-video"
                        onTimeUpdate={() => {this.setState({video_currentTime: this.getCurrentTime()})}}
                    >
                        <source src={this.props.url}></source>
                    </video>
                    <div
                        className="Video-overlay"
                    >
                        <div
                            className="Video-play"
                            onMouseOver={() => {this.setState({hover_play: true})}}
                            onMouseOut={() => {this.setState({hover_play: false})}}
                            onClick={() => {this.props.playPause(this.getCurrentTime())}}
                        ><FontAwesomeIcon icon={this.props.play ? faPause : faPlay} /></div>
                        <div
                            className="Video-audio"
                            onMouseOver={() => {this.setState({hover_audio: true})}}
                            onMouseOut={() => {this.setState({hover_audio: false})}}
                        ><FontAwesomeIcon icon={faVolumeMute} /></div>
                        <div
                            className="Video-fullscreen"
                            onMouseOver={() => {this.setState({hover_fullscreen: true})}}
                            onMouseOut={() => {this.setState({hover_fullscreen: false})}}
                            onClick={this.handleFullscreen}
                        ><FontAwesomeIcon icon={this.isFullScreen() ? faCompress : faExpand} /></div>
                        <div
                            ref={this.videoScrubber}
                            className="Video-scrubber"
                            onMouseMove={this.scrubberPeek}
                            onMouseEnter={() => {this.setState({hover_scrubber: true})}}
                            onMouseLeave={() => {
                                this.setState({hover_scrubber: false});
                                this.doSeek();
                            }}
                            onMouseDown={() => {
                                this.setState({seeking: true});
                            }}
                            onMouseUp={() => {
                                this.doSeek();
                            }}
                        >
                            <div className="Video-scrubber-bg"></div>
                            <div
                                className="Video-scrubber-bar"
                                style={{
                                    width: ((this.state.video_currentTime / this.getDuration()) * 100) + '%'
                                }}
                            ></div>
                            <div className="Video-scrubber-time"
                                style={{
                                    left: this.state.peek.left
                                }}
                            >{this.getTime(this.state.peek.time)}</div>
                        </div>
                    </div>
                </figure>
            </div>
        );
    }
}

export default Video;
