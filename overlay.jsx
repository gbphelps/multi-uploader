import React from 'react';
import Sonar from './sonar';
import { CSSTransition } from 'react-transition-group';
import configs from './styleConfigs';
import Folder from './icons/folder';
import store from './treeStore';

export default class Overlay extends React.Component {
    constructor(props){
        super(props)
        this.state={
            open: false,
        }
    }

    componentDidUpdate(prev){
        if (prev.status !== 'hover' && this.props.status === 'hover'){
            this.setState({open: true})
        } 
    }

    renderLoading(){
        return (
            <div className="over-container">
                <div className="dot-dot"> 
                    <div className="overlay-bg">
                        <div className="loader">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
                <div className="note" style={{
                    bottom: (configs.NUM_ROWS*configs.ROW_HEIGHT - 200)/2,
                }}>
                        processing your files...
                </div>
            </div>
        )
    }

    renderHover(){
        return (
            <div className="over-container">
                <div className={`plus ${this.props.status}`}> 
                    <div className="overlay-bg">
                        <svg 
                            className="dropper" 
                            viewBox="-30 -30 60 60" 
                            height="38" 
                            stroke="white" 
                            strokeWidth="12"
                            filter="url(#s)"
                            strokeLinecap="round"
                        >
                            <line y1="-25" y2="25"/>
                            <line x1="-25" x2="25"/>
                        </svg>
                    </div>
                </div>
                <span className="note" style={{
                    bottom: (configs.NUM_ROWS*configs.ROW_HEIGHT - 200)/2,
                }}>
                    drop to load folder
                </span>
            </div>
        )
    }

    renderInactive(){
        return (
            <div className='over-container'>
                <div className={`no-folder ${this.props.status}`}> 
                <div className="overlay-bg">
                    <Folder style={{ 
                        height: '50%', 
                        width: 'auto', 
                        filter: `url(#s)` 
                    }}/>
                </div>
                </div>
                    <span className="note" style={{
                    bottom: (configs.NUM_ROWS*configs.ROW_HEIGHT - 200)/2,
                }}>
                        Drag to upload or&nbsp;
                        <label htmlFor="upload-more" className="button-cta">
                            click here
                        </label>
                    </span>
            </div>
        )
    }


    renderDoneSuccess(){
        return (
            <div className='over-container'>
                <div className={`done-success ${this.props.status}`}> 
                <div className="overlay-bg">
                    <svg viewBox="-5 -5 55 50" style={{
                        height: 45, 
                        flexShrink: 0,
                        position: 'absolute',
                        width: 'auto', 
                        display: 'block', 
                        margin: 0,
                        transition: '.2s',
                        transitionDelay: '.4s',
                        filter: "url(#s2)"
                    }}>
                        <path d="M 0 20 L 15 40 L 45 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" stroke="white" fill="transparent"/>
                    </svg>
                </div>
                </div>
                    <span className="note" style={{
                    bottom: (configs.NUM_ROWS*configs.ROW_HEIGHT - 200)/2,
                }}>
                        All set!
                    </span>
            </div>
        )
    }


    renderDoneError(){
        return (
            <div className='over-container' style={{padding: 16}}>
                <div 
                    className={`done-error ${this.props.status}`}
                    style={{
                        background: 'white',
                        borderRadius: 3,
                        boxShadow: '0 2px 5px 0 rgba(0,0,0,.2)',
                        width: 400,
                        height: 300,
                        maxWidth: '100%'
                    }}
                >
                <div className="overlay-bg">
                    <svg viewBox="-5 -5 55 50" style={{
                        height: 45, 
                        flexShrink: 0,
                        position: 'absolute',
                        width: 'auto', 
                        display: 'block', 
                        margin: 0,
                        transition: '.2s',
                        transitionDelay: '.4s',
                        filter: "url(#s2)"
                    }}>
                        <path d="M 0 20 L 15 40 L 45 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" stroke="white" fill="transparent"/>
                    </svg>
                </div>
                </div>
                    <span className="note" style={{
                    bottom: (configs.NUM_ROWS*configs.ROW_HEIGHT - 200)/2,
                }}>
                        Oops
                    </span>
            </div>
        )
    }

    render(){
        return (
            <>
                {/* <Sonar 
                    killed={this.props.status !== 'hover'} 
                    pulseNum={2}
                /> */}

                <CSSTransition 
                    timeout={200}
                    mountOnEnter
                    unmountOnExit
                    in={this.props.status === "empty"}
                >
                    {this.renderInactive()}
                </CSSTransition>

                <CSSTransition 
                    timeout={200}
                    mountOnEnter
                    unmountOnExit
                    in={this.props.status === "hover"}
                >
                    {this.renderHover()}
                </CSSTransition>
                
                <CSSTransition 
                    timeout={200}
                    mountOnEnter
                    unmountOnExit
                    in={ this.props.status === "loading" }
                >
                    {this.renderLoading()}
                </CSSTransition>

                <CSSTransition 
                    timeout={200}
                    mountOnEnter
                    unmountOnExit
                    in={ this.props.status === "done-success" }
                >
                    {this.renderDoneSuccess()}
                </CSSTransition>

                <CSSTransition 
                    timeout={200}
                    mountOnEnter
                    unmountOnExit
                    in={ this.props.status === "done-error" }
                >
                    {this.renderDoneError()}
                </CSSTransition>
            </>
        )
    }
}