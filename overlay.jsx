import React from 'react';
import Sonar from './sonar';
import { CSSTransition } from 'react-transition-group';
import configs from './styleConfigs';

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
            <div className="overlay loading"> 
                <div className="overlay-bg">
                    <div className="loader">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        )
    }

    renderHover(){
        return (
            <div className="overlay hover"> 
                <div className="overlay-bg">
                    <svg className="dropper" viewBox="-30 -30 60 60" height="30" stroke="white" strokeWidth="10">
                        <line strokeLinecap="round" y1="-25" y2="25"/>
                        <line strokeLinecap="round" x1="-25" x2="25"/>
                    </svg>
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