import React from 'react';
import Sonar from './sonar';
import { CSSTransition } from 'react-transition-group';
import configs from './styleConfigs';
import Folder from './icons/folder';

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
            <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
            }}>
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
            <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute'
            }}>
                <div className={`plus ${this.props.status}`}> 
                    <div className="overlay-bg">
                        <svg 
                            className="dropper" 
                            viewBox="-30 -30 60 60" 
                            height="38" 
                            stroke="white" 
                            strokeWidth="12"
                            filter="url(#s)"
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
            <div className='no-folder-container'>
                <div className="no-folder">
                    <Folder style={{ 
                        height: '50%', 
                        width: 'auto', 
                        filter: `url(#s)` 
                    }}/>
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: (configs.NUM_ROWS*configs.ROW_HEIGHT - 200)/2,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'rgba(0,0,0,.7)'
                }}>
                    Drag to upload or&nbsp;<button>click here</button>
                </div>
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
                    in={this.props.status === "inactive"}
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
            </>
        )
    }
}