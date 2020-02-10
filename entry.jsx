import React from 'react';
import store from './treeStore';

export default class Entry extends React.Component {
    constructor(props){
        super(props);

        const { idxs } = props;
        this.entry = store.getState()[idxs[0]];
        for (let i=1; i<props.idxs.length; i++){
            this.entry = this.entry.children[idxs[i]]
        }

        this.state = {
            open: this.entry.expanded,
            visibleRows: this.entry.visibleRows,
        }

        this.renderChild = this.renderChild.bind(this);
        store.subscribe(this, props.idxs);
    }

    renderSelf(){
        const padding = 12 + (this.props.idxs.length-1) * 24;
        
        if (this.entry.item.isFile) return (
            <div 
                className="entry" 
                style={{paddingLeft: padding }}
            >
                {this.entry.item.name}
            </div>)
        return (
            <div 
                className="entry"
                style={{paddingLeft: padding }}
                onClick={()=>{
                    store.toggle(this.props.idxs)
                }}
            >
                {this.entry.item.name} { this.state.visibleRows }
            </div>
        )
    }

    renderChild(_, i){
        const idxs = this.props.idxs.slice();
        idxs.push(i);
        return <Entry idxs={idxs}/>
    }

    render(){      
        return (
            <>
                { this.renderSelf() }
                { (!this.entry.item.isFile && this.entry.expanded) && 
                    this.entry.children.map(this.renderChild) 
                }
            </>
        )
    }
}