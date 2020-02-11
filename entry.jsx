import React from 'react';
import store from './treeStore';


const HEIGHT = 40;

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
            shrinking: false,
        }

        this.renderChild = this.renderChild.bind(this);
        store.registerNode(this, props.idxs);
    }

    componentDidUpdate(_,prevState){
        if (prevState.expanded && !this.state.expanded) this.setState({shrinking: true})
    }

    renderSelf(){
        const padding = 12 + (this.props.idxs.length-1) * 24;
        
        if (this.entry.item.isFile) return (
            <div 
                className={`entry ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{paddingLeft: padding, height: HEIGHT }}
            >
                {this.entry.item.name}
            </div>)
        return (
            <div 
                className={`entry ${this.state.rootHeight%2 ? 'even' : 'odd'}`}
                style={{paddingLeft: padding, height: HEIGHT }}
                onClick={()=>{
                    store.toggle(this.props.idxs)
                }}
            >
                {this.entry.item.name} vis{ this.state.visibleRows } h{this.state.rootHeight}
            </div>
        )
    }

    renderChild(_, i){
        const idxs = this.props.idxs.slice();
        idxs.push(i);
        return <Entry idxs={idxs}/>
    }

    render(){  
        //TODO you can try only enabling the transition for the parent expander for better performance.
        return (
            <div 
                className="dir-contents" 
                style={{height: HEIGHT*this.state.visibleRows }}
                onTransitionEnd={()=>{
                    this.setState({shrinking: false})
                }}
            >
                { this.renderSelf() }
                { (!this.entry.item.isFile && (this.state.expanded || this.state.shrinking)) && 
                    this.entry.children.map(this.renderChild) 
                }
            </div>
        )
    }
}