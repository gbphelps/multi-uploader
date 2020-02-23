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
        store.registerNode(this, props.idxs, [
            'expanded',
            'rootHeight',
            'visibleRows',
            'loadAmt', 
            'loadStarted', 
            'loadedFiles',
            'loaded'
        ]);
    }

    renderSelf(){
        return (
            <div 
                className={`entry load-data ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{height: configs.ROW_HEIGHT }}
            >
                <div className="load-container">
                    { this.state.loadStarted && (
                        <div className="load-track" style={this.state.loaded ? {
                            width: 8,
                            } : {}}>
                            <div className="load-progress" style={{
                                width: `${this.state.loadAmt / this.state.bytes * 100}%`
                            }}/>
                        </div>
                    )}
                </div>
                <div style={{ width: 150, textAlign: 'right', color: 'rgba(255,255,255,.3)'}}>
                    { this.state.loadedFiles }/{ this.state.numFiles } files
                </div>
                <div style={{ width: 150, textAlign: 'right', color: 'rgba(255,255,255,.3)'}}>
                    { (this.state.loadAmt/this.state.bytes * 100).toFixed(1) }%
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