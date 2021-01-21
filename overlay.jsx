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
        const emptyArr = [];
        for (let i=0; i<configs.ERROR_MODAL_HEIGHT - store.getErrors().length; i++) emptyArr.push(null);
        console.log(emptyArr)

        return (
            <div className='over-container' style={{padding: 16}}>
                <div 
                    style={{
                        background: '#f0f0f0',
                        boxShadow: '0 10px 15px 0px rgba(0,0,0,.2)',
                        width: 600,
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        borderRadius: 3,
                        border: '1px solid #ccc',
                    }}
                >
                    <div style={{
                        padding: 12,
                        borderTopRightRadius: 2,
                        borderTopLeftRadius: 2,
                        color: '#777', 
                    }}>
                        <div style={{
                            fontSize: 14,
                            fontWeight: 500,
                            marginRight: 8,
                            width: 'auto', 
                            display: 'inline-flex', 
                            height: 20,
                            width: 20,
                            borderRadius: '50%',
                            color: 'white',
                            textShadow: `0 -1px rgba(0,0,0,.4)`,
                            background: 'tomato',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 2px 0 rgba(0,0,0,.3)'
                        }}>!</div>
                        The following files failed to load
                   </div>

                   <div style={{
                       background: '#f0f0f0', 
                       padding: 16, 
                       display: 'flex',
                       flexDirection: 'column',
                       width: '100%',
                       position:'relative',
                       flexShrink: 1,
                       flexGrow: 1,
                       borderBottomRightRadius: 2,
                       borderBottomLeftRadius: 2,
                       overflow: 'hidden'
                    }}>                       
                    <div style={{
                        height: configs.ERROR_MODAL_HEIGHT * configs.ROW_HEIGHT + 2, 
                        border: '1px solid #ccc', 
                        borderRadius: 3,
                        width: '100%', 
                        position: 'relative',
                        display: 'flex',
                        overflow: 'auto',
                        overflowY: store.getErrors().length < configs.ERROR_MODAL_HEIGHT ? 'hidden' : 'scroll',
                    }}>
                        <div style={{height: '100%', flexGrow: 1, zIndex: 0}}>
                            { 
                                store.getErrors().map((e,i)=> <div 
                                    className={`entry ${i%2 ? 'even' : 'odd'}`} 
                                    style={{
                                        height: configs.ROW_HEIGHT, 
                                        paddingLeft: configs.LEFT_MARGIN, 
                                        paddingRight: configs.LEFT_MARGIN}}
                                    >
                                        {e.fullPath}
                                    </div>) 
                            }{
                                emptyArr.map((_,i)=><div style={{height: configs.ROW_HEIGHT}} className={`entry ${(i+store.getErrors().length)%2 ? 'even' : 'odd'}`}/>)
                            }
                        </div>
                    </div>
                   </div>
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