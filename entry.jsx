import React from 'react';
import store from './treeStore';
import configs from './styleConfigs';
import { Transition } from 'react-transition-group';
import Folder from './icons/folder';
import FolderOpen from './icons/folderOpen';
import File from './icons/imgDoc';
import Doc from './icons/doc';
import Pic from './icons/picture';

import Branches from './branches';


export default class Entry extends React.Component {
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
            loadAmt: this.entry.loadAmt,
        }

        this.renderChild = this.renderChild.bind(this);
        store.registerNode(this, props.idxs);
    }

    renderFolderState(){
        return (
            <Transition 
                in={this.state.expanded} 
                timeout={!configs.DISABLE_ANIMATION && configs.ANIMATION_DURATION}
            >
                {
                    state => (
                        state === 'exited' ? <Folder style={{height: configs.ICON_SIZE}} /> : <FolderOpen style={{height: configs.ICON_SIZE}} />
                    )
                }
            </Transition>
        )
    }

    renderSelf(){
        const padding = configs.LEFT_MARGIN + (this.props.idxs.length-1) * configs.INDENT;
        
        if (this.entry.item.isFile) return (
            <div 
                className={`entry ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{paddingLeft: padding, height: configs.ROW_HEIGHT }}
            >
                <Branches 
                    depth={this.props.idxs.length}
                    finalIdxs={this.entry.finalIdxs} 
                    expanded={this.state.expanded}
                    anyChildren={false}
                /><Doc style={{height: configs.ICON_SIZE}} /> {this.entry.item.name} {this.state.loadAmt}
            </div>)
        return (
            <div 
                className={`entry ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{paddingLeft: padding, height: configs.ROW_HEIGHT }}
                onClick={()=>{
                    store.toggle(this.props.idxs)
                }}
            >
                <Branches 
                    depth={this.props.idxs.length}
                    finalIdxs={this.entry.finalIdxs}
                    expanded={this.state.expanded}
                    anyChildren={!!this.entry.children.length}
                />
                {this.renderFolderState()} {this.entry.item.name} {this.state.loadAmt}
            </div>
        )
    }

    renderChild(_, i){
        const idxs = this.props.idxs.slice();
        idxs.push(i);
        return <Entry key={i} idxs={idxs}/>
    }

    render(){  
        //TODO you can try only enabling the transition for the parent expander for better performance.
        
        return (
            <div 
                className="dir-contents" 
                style={ configs.DISABLE_ANIMATION ? {} : {
                    height: configs.ROW_HEIGHT*this.state.visibleRows,
                    transitionDuration: `${configs.ANIMATION_DURATION}ms`
                }}
            >
                { this.renderSelf() }
                { !this.entry.item.isFile && (
                    <Transition 
                        in={this.state.expanded} 
                        timeout={!configs.DISABLE_ANIMATION && configs.ANIMATION_DURATION} 
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