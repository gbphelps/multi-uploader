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
            open: false,
        }

        this.renderChild = this.renderChild.bind(this);

        console.log('constructed')
    }


    renderSelf(){
        if (this.entry.item.isFile) return <div className="entry">{this.entry.item.name}</div>
        return (
            <div 
                className="entry"
                onClick={()=>{
                    this.setState(s => ({open: !s.open}))
                }}
            >
                {this.entry.item.name}
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
                { (!this.entry.isFile && this.state.open) && 
                    this.entry.children.map(this.renderChild) 
                }
            </>
        )
    }
}