import React from 'react';

export default class Sonar extends React.Component {
    constructor(props){
        super(props);
        const pulses = [];
        for (let i=0; i<props.pulseNum; i++) pulses.push('inactive');
        this.state = { pulses }
        this.renderPulse = this.renderPulse.bind(this)
    }
    
    componentDidUpdate(oldProps){
        if (oldProps.killed && !this.props.killed){
            this.setState(s=>({
                pulses: s.pulses.map(()=>'active')
            }))
        }
    }

    renderPulse(state, i){
        if (state !== 'active') return null;
        return (
            <div 
                key={i} 
                className={`pulsar ${state}`} 
                onAnimationIteration={()=>{
                    if (this.props.killed) this.setState(s => {
                        const pulses = s.pulses.slice();
                        pulses[i] = 'inactive';
                        return { pulses }
                    })
                }}
            />
        )
    }

    render(){
        return (
            <div className="pulse">
                { this.state.pulses.map(this.renderPulse) }
            </div>
        )
    }
}