import React from 'react';
import store from './treeStore';
import configs from './styleConfigs';
import { Transition } from 'react-transition-group';
import f from './formatBytes';
import { DateTime } from 'luxon';

export default class SideCar extends React.Component {
    constructor(props){
        super(props);

        const { idxs } = props;
        this.entry = store.getState();

        for (let i=0; i<props.idxs.length; i++){
            this.entry = this.entry.children[idxs[i]]
        }

        this.state = {
            ...this.entry
        }

        this.renderChild = this.renderChild.bind(this);
        const keys = ['expanded', 'rootHeight'];
        if (!configs.DISABLE_ANIMATION) keys.push('visibleRows');

        store.registerNode(this.setState.bind(this), props.idxs, keys);
    }

    componentWillUnmount(){
        store.unregisterNode(this.props.idxs);
    }

    renderSelf(){
        return (
            <div 
                className={`entry ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{height: configs.ROW_HEIGHT }}
            >
              <div className="static-col size">{f(this.entry.bytes)}</div>
              {/* <div className="static-col size">{this.entry.type}</div> */}
              <div className="static-col modified">{ DateTime.fromMillis(+this.entry.modificationTime).toFormat(`MMM dd, yyyy  hh:mm a`) }</div>

            </div>
        )
    }

    renderChild(_, i){
        const idxs = this.props.idxs.slice();
        idxs.push(i);
        return <SideCar key={i} idxs={idxs}/>
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