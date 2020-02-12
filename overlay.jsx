import React from 'react';
import Sonar from './sonar';

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

    render(){
        return (
            <>
                <Sonar 
                    killed={this.props.status !== 'hover'} 
                    pulseNum={2}
                />

            <div 
                className={`overlay ${this.props.status} ${this.state.open}`}
                onTransitionEnd={()=>{
                    if (this.props.status === 'hover') return;
                    this.setState({open: false})
                }}
            > 
                <div className="temp-status">
                    <svg className="dropper" viewBox="-30 -30 60 60" height="30" stroke="white" stroke-width="10">
                        <line stroke-linecap="round" y1="-25" y2="25"/>
                        <line stroke-linecap="round" x1="-25" x2="25"/>
                    </svg>
                    <div className="loader">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
            </>
        )
    }
}