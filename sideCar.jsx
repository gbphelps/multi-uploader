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
        this.entry = store.getState()[idxs[0]];

        for (let i=1; i<props.idxs.length; i++){
            this.entry = this.entry.children[idxs[i]]
        }

        this.state = {
            expanded: this.entry.expanded,
            visibleRows: this.entry.visibleRows,
            rootHeight: this.entry.rootHeight,
        }

        this.renderChild = this.renderChild.bind(this);
        store.registerNode(this, props.idxs);
    }

    componentDidMount(){
        console.log(this.entry)
    }
    renderSelf(){
        return (
            <div 
                className={`entry ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{height: configs.ROW_HEIGHT }}
            >
              <div className="static-col size">{ this.entry.item.isFile ? f(this.entry.bytes) : <>&ndash;</> }</div>
              <div className="static-col modified-1">{ DateTime.fromMillis(+this.entry.modificationTime).toFormat(`MMM d, yyyy`) }</div>
              <div className="static-col modified-2">{ DateTime.fromMillis(+this.entry.modificationTime).toFormat(`h:mm a`) }</div>
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
                style={{
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