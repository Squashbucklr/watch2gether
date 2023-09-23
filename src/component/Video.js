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

const OFFSET_TOLERANCE = 0.25;

class Video extends React.Component {
    constructor(props) {
        super(props);
        this.needsTimeChange = true;
        this.needsAudioChange = true;
        this.needsSourceLoad = false;
        this.mouseTimeout = null;
        this.videoNode = React.createRef();
        this.videoWrapper = React.createRef();
        this.videoScrubber = React.createRef();
        this.videoAudioScrubber = React.createRef();
        this.audio_memory = 0;
        this.state = {
            seeking: false,
            seekingAudio: false,
            videoOverlayHovers: [false, false, false, false, false, false, false],
            video_currentTimeStamp: 0,
            video_currentTimeFrac: 0,
            video_duration: 0,
            video_fullscreen: false,
            video_audio_level: 1,
            hideMouse: true,
            peek: {
                left: 0,
                time: 0
            }
        }
    }

    componentDidMount = () => {
        this.fixVideoPosition();
        document.onkeydown = (e) => {
            console.log(e);
            if (e.target.localName !== 'input' && e.target.localName !== 'textarea') {
                switch (e.code) {
                    case 'Space':
                    case 'KeyK':
                        this.props.playPause(this.getCurrentTime(), this.getDuration());
                        break;
                    case 'ArrowRight':
                    case 'KeyL':
                        if (e.shiftKey) this.props.seek(this.getCurrentTime() + 85);
                        else this.props.seek(this.getCurrentTime() + 5);
                        break;
                    case 'ArrowLeft':
                    case 'KeyJ':
                        if (e.shiftKey) this.props.seek(this.getCurrentTime() - 85);
                        else this.props.seek(this.getCurrentTime() - 5);
                        break;
                    case 'KeyF':
                        this.handleFullscreen();
                }
            }
        }
    }

    shouldComponentUpdate = (nextProps, nextState) => {
        this.needsTimeChange = Math.abs(this.props.time - nextProps.time) > 0.01;
        this.needsAudioChange = Math.abs(this.state.video_audio_level - nextState.video_audio_level) > 0.001;
        this.needsSourceLoad = this.props.url !== nextProps.url;
        return true;
    }

    componentDidUpdate = () => {
        if (this.needsSourceLoad) this.videoNode.current.load();
        if (this.needsTimeChange) this.fixVideoPosition();
        if (this.needsAudioChange) this.fixAudioValue();
        if (this.getCurrentTime() === this.getDuration() && this.props.play) {
            console.log('fake pause');
            this.props.fakePause();
        }
        if (this.videoNode.current.paused && this.props.play &&
            this.getCurrentTime() < this.getDuration()) {
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
            let frac = this.props.time / this.getDuration();
            if (isNaN(frac)) frac = 0;
            this.setState({
                video_currentTimeStamp: this.getTime(this.props.time),
                video_currentTimeFrac: frac
            })
        }
    }

    fixAudioValue = () => {
        this.videoNode.current.volume = this.state.video_audio_level;
    }

    scrubberPeek = (e) => {
        let scrubBox = this.videoScrubber.current.getBoundingClientRect();
        let scrubThru = ((e.pageX - scrubBox.x) / scrubBox.width);
        if (scrubThru <= 0) scrubThru = 0;
        if (scrubThru >= 1) scrubThru = 1;
        this.scrubFrac(scrubThru);
        
    }

    scrubberAudioPeek = (e) => {
        let scrubBox = this.videoAudioScrubber.current.getBoundingClientRect();
        let scrubThru = 1 - ((e.pageY - scrubBox.y) / (scrubBox.height - 5));
        if (scrubThru <= 0) scrubThru = 0;
        if (scrubThru >= 1) scrubThru = 1;
        this.scrubAudioFrac(scrubThru);
        
    }

    scrubFrac = (frac) => {
        this.setState({
            peek: {
                left: (frac * 100) + '%',
                time: frac * this.getDuration()
            }
        });
    }

    scrubAudioFrac = (frac) => {
        this.setState({
            peekAudio: {
                value: frac
            }
        });
    }

    mouseHide = (time) => {
        return (e) => {
            clearTimeout(this.mouseTimeout);
            this.setState({hideMouse: false});
            this.mouseTimeout = setTimeout(() => {
                let show = false;
                for (const zone of this.state.videoOverlayHovers) {
                    if (zone) {
                        show = true;
                        break;
                    }
                }
                if(!show) {
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

    doSeekAudio = () => {
        if(this.state.seekingAudio) {
            if (this.state.peekAudio.value === 0) {
                this.audio_memory = this.state.video_audio_level;
            }
            this.setState({video_audio_level: this.state.peekAudio.value})
        }
        this.setState({seekingAudio: false});
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
            else if (this.videoWrapper.current.webkitRequestFullScreen)
                this.videoWrapper.current.webkitRequestFullScreen();
            else if (this.videoWrapper.current.msRequestFullscreen) this.videoWrapper.current.msRequestFullscreen();
        }
    }

    handleVideoOverlayHover = (zone, hover) => {
        let newVideoOverlayHovers = [...this.state.videoOverlayHovers];
        newVideoOverlayHovers[zone] = hover;
        this.setState({videoOverlayHovers: newVideoOverlayHovers});
    }

    handleMute = (e) => {
        if (e.target == e.currentTarget) {
            if (this.state.video_audio_level > 0) {
                this.audio_memory = this.state.video_audio_level;
                this.setState({video_audio_level: 0});
            } else {
                this.setState({video_audio_level: this.audio_memory});
            }
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
                        onTimeUpdate={() => {
                            this.setState({
                                video_currentTimeStamp: this.getTime(this.getCurrentTime()),
                                video_currentTimeFrac: this.getCurrentTime() / this.getDuration()
                            })
                        }}
                        onDurationChange={() => {this.setState({video_duration: this.getDuration()})}}
                    >
                        <source src={this.props.url}></source>
                    </video>
                    <div
                        className="Video-overlay"
                    >
                        <div
                            className="Video-play"
                            onMouseOver={() => {this.handleVideoOverlayHover(1, true)}}
                            onMouseOut={() => {this.handleVideoOverlayHover(1, false)}}
                            onClick={() => {this.props.playPause(this.getCurrentTime(), this.getDuration())}}
                        ><FontAwesomeIcon icon={this.props.play ? faPause : faPlay} /></div>
                        <div
                            className="Video-audio"
                            onMouseOver={() => {this.handleVideoOverlayHover(2, true)}}
                            onMouseOut={() => {this.handleVideoOverlayHover(2, false)}}
                            onClick={this.handleMute}
                        >
                            <FontAwesomeIcon className="Video-hide-icon" icon={
                            this.state.video_audio_level > 0.5 ? faVolumeUp :
                                this.state.video_audio_level === 0 ? faVolumeMute : faVolumeDown} />
                            <div
                                ref={this.videoAudioScrubber}
                                className="Video-audio-scrubber"
                                onMouseMove={this.scrubberAudioPeek}
                                onMouseLeave={() => {
                                    this.doSeekAudio();
                                }}
                                onMouseDown={() => {
                                    this.setState({seekingAudio: true});
                                }}
                                onMouseUp={() => {
                                    this.doSeekAudio();
                                }}
                            >
                                <div className="Video-audio-scrubber-bg"></div>
                                <div
                                    className="Video-audio-scrubber-bar"
                                    style={{
                                        height: (this.state.video_audio_level * 100) + '%'
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div
                            className="Video-fullscreen"
                            onMouseOver={() => {this.handleVideoOverlayHover(3, true)}}
                            onMouseOut={() => {this.handleVideoOverlayHover(3, false)}}
                            onClick={this.handleFullscreen}
                        ><FontAwesomeIcon icon={this.isFullScreen() ? faCompress : faExpand} /></div>
                        <div
                            className="Video-time-through"
                            onMouseOver={() => {this.handleVideoOverlayHover(4, true)}}
                            onMouseOut={() => {this.handleVideoOverlayHover(4, false)}}
                        >{this.state.video_currentTimeStamp}</div>
                        <div
                            className="Video-time-total"
                            onMouseOver={() => {this.handleVideoOverlayHover(5, true)}}
                            onMouseOut={() => {this.handleVideoOverlayHover(5, false)}}
                        >{this.getTime(this.state.video_duration)}</div>
                        <div
                            ref={this.videoScrubber}
                            className="Video-scrubber"
                            onMouseMove={this.scrubberPeek}
                            onMouseEnter={() => {this.handleVideoOverlayHover(0, true)}}
                            onMouseLeave={() => {
                                this.handleVideoOverlayHover(0, false);
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
                                    width: (this.state.video_currentTimeFrac * 100) + '%'
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
