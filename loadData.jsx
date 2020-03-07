import React from 'react';
import store from './treeStore';
import configs from './styleConfigs';
import { Transition } from 'react-transition-group';
import f from './formatBytes';
import { DateTime } from 'luxon';

export default class LoadData extends React.Component {
    constructor(props){
        super(props);

        const { idxs } = props;
        this.entry = store.getState()[idxs[0]];

        for (let i=1; i<props.idxs.length; i++){
            this.entry = this.entry.children[idxs[i]]
        }

        this.state = {
           ...this.entry
        }

        this.renderChild = this.renderChild.bind(this);
        const keys = [
            'expanded',
            'rootHeight',
            'loadAmt', 
            'loadStarted', 
            'loadedFiles',
            'loaded',
            'loadError',
        ];
        if (!configs.DISABLE_ANIMATION) keys.push('visibleRows');

        store.registerNode(this, props.idxs, keys);
    }

    renderSelf(){
        return (
            <div 
                className={`entry load-data ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{
                    height: configs.ROW_HEIGHT,
                }}
            >
                <div className="load-progress-cell">
                    { this.state.loadStarted && (
                        <div className={`load-track ${this.state.loaded ? 'loaded' : ''} ${this.state.loadError ? 'error' : ''}`} style={this.state.loaded || this.state.loadError ? {
                            width: 8,
                            animationName: 'check-grow',
                            animationDelay: '.2s',
                            animationDuration: '.2s',
                            animationFillMode: 'forwards',
                            } : {}}>
                            <div className="load-progress" style={{
                                width: this.state.loadError ? '100%' : `${this.state.loadAmt / this.state.bytes * 100}%`
                            }}>
                                <svg viewBox="-5 -5 55 50" style={{
                                    height: 12, 
                                    position: 'absolute',
                                    width: 'auto', 
                                    display: 'block', 
                                    margin: 0,
                                    transform: this.state.loaded ? 'none' : 'scale(0)',
                                    transition: '.2s',
                                    transitionDelay: '.4s',
                                    filter: "url(#s2)"
                                }}>
                                    <path d="M 0 20 L 15 40 L 45 0" strokeLinecap="round" strokeWidth="5" stroke="white" fill="transparent"/>
                                </svg>

                                <span viewBox="-5 -5 55 50" style={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    position: 'absolute',
                                    width: 'auto', 
                                    display: 'block', 
                                    transform: this.state.loadError ? 'none' : 'scale(0)',
                                    transition: '.2s',
                                    transitionDelay: '.4s',
                                    color: 'white',
                                    textShadow: `0 -1px rgba(0,0,0,.4)`
                                }}>!</span>

                            </div>
                        </div>
                    )}
                </div>
                <div className="load-pct-cell">
                    { (this.state.loadAmt/this.state.bytes * 100).toFixed(1) }%
                </div>
                <div className="load-files-cell">
                    { this.entry.item.isFile ? 
                        null : 
                        <>{ this.state.loadedFiles }/{ this.state.numFiles }</>
                    }
                </div>
            </div>
        )
    }

    renderChild(_, i){
        const idxs = this.props.idxs.slice();
        idxs.push(i);
        return <LoadData key={i} idxs={idxs}/>
    }

    render(){ 
        
        //todo turn off/on animations based on scroll position? might be even less performant though.
        
        return (
            <div 
                className="dir-contents" 
                style={configs.DISABLE_ANIMATION ? {} : {
                    height: configs.ROW_HEIGHT*this.state.visibleRows,
                    transitionDuration: `${configs.ANIMATION_DURATION}ms`,
                }}
            >
                { this.renderSelf() }
                { !this.entry.item.isFile && (
                    <Transition 
                        in={this.state.expanded} 
                        timeout={configs.ANIMATION_DURATION} 
                        mountOnEnter 
                        unmountOnExit
                    >
                        <>
                            { this.entry.children.map(this.renderChild) }
                        </>
                    </Transition>
                )}
            </div>
        )
    }
}