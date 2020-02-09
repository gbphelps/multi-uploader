import React from 'react';

export default class Sonar extends React.Component {
    constructor(props){
        super(props);
       
        const pulses = [];
        for (let i=0; i<props.pulseNum; i++) pulses.push('active');
        this.state = { pulses };

        this.kill = this.kill.bind(this);
        this.renderPulse = this.renderPulse.bind(this);
    }  

    componentDidUpdate(old){
        if (old.killed && !this.props.killed) {
            this.setState(s => ({
                pulses: s.pulses.map(()=>'active')
            }))
        }
    }

    kill(i){
        this.setState(s => {
            const pulses = Array.from(s.pulses);
            pulses[i] = 'inactive';
            return { pulses }
        })
    }

    renderPulse(status, i){
        if (status === 'inactive') return null;
        return (
            <div
                className="pulsar"
                style={{animationDelay: `${i * this.props.interval}s`}}
                onAnimationIteration={()=>{
                    if (!this.props.killed) return;
                    this.kill(i)
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