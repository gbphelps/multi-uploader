import React from 'react';
import Sonar from './sonar';
import { Transition } from 'react-transition-group';

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

    renderOverlay(state){
        return (
            <div className={`overlay ${state ==='entering' || state ==='exiting' ? 'shrunk' : ''}`}> 
                <div className="temp-status">
                    <svg className="dropper" viewBox="-30 -30 60 60" height="30" stroke="white" strokeWidth="10">
                        <line strokeLinecap="round" y1="-25" y2="25"/>
                        <line strokeLinecap="round" x1="-25" x2="25"/>
                    </svg>
                    <div className="loader">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        )
    }

    render(){
        return (
            <>
                <Sonar 
                    killed={this.props.status !== 'hover'} 
                    pulseNum={2}
                />
            <Transition 
                timeout={200} 
                in={ this.props.status === 'hover' || this.props.status === 'loading' }
                unmountOnExit
                mountOnEnter
            >
                {this.renderOverlay}
            </Transition>
            </>
        )
    }
}