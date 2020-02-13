import React from 'react';
import 'regenerator-runtime';
import Entry from './entry';

import store from './treeStore';
import configs from './styleConfigs';
import Overlay from './overlay';

import { TransitionGroup, Transition } from 'react-transition-group';

export default class extends React.Component {
    constructor(props){
        super(props);
        this.counter = 0;
        this.state = {
            status: 'inactive',
            tree: false,
            height: 0,
        }
        this.getTree = this.getTree.bind(this);
        store.registerContainer(this);
    }
    
    disable(e){
        e.preventDefault();
        e.stopPropagation();
    }

    getTree(item, idxs=[], finalIdxs=[]){
        if (item.isFile) return Promise.resolve({
            item,
            idxs,
            visibleRows: 1,
            rootHeight: -1,
            finalIdxs,
        });
        
        return new Promise(resolve => {
            const r = item.createReader();
            r.readEntries((entries) => {
                const promises = entries
                    .map((item,i) => {
                        return this.getTree(
                            item, 
                            idxs.concat([i]), 
                            finalIdxs.concat([i === entries.length - 1])
                        )
                    })
                Promise.all(promises).then(result => {
                    resolve({
                        item,
                        children: result,
                        idxs,
                        expanded: false,
                        visibleRows: 1,
                        rootHeight: -1,
                        finalIdxs,
                    })
                })
            }, () => {
                console.error("This repo does not work locally. It must be served on localhost using `npm run serve`.")
            })
        })
    }


    renderTree(){
        if (!this.state.tree) return false;
        return store.getState().map((_,idx) => <Entry key={idx} idxs={[idx]}/>)
    }

    renderFiller(){
        const { height } = this.state;
        const numRows = configs.NUM_ROWS - height;

        const rows = [];
        for (let i=0; i<numRows; i++) rows.push(
            <Transition key={i} timeout={configs.ANIMATION_DURATION}>
                <div 
                    className={`entry ${(height+i)%2 ? 'even' : 'odd'}`}
                    style={{ height: configs.ROW_HEIGHT }}
                />
            </Transition>
        );
        return rows;
    }


    render(){
        return (
            <div className="site-container">
                <div 
                    style={{ height: configs.ROW_HEIGHT * configs.NUM_ROWS }}
                    className={`uploader ${this.state.status}`}
                    onDrag={this.disable}
                    onDragStart={this.disable}
                    onDragOver={this.disable}
                    onDragEnd={this.disable}
                    onDragEnter={this.disable}
                    onDragExit={this.disable}
                    onDragEnter={(e)=>{
                        e.preventDefault();
                        this.counter++;
                        if (this.counter === 1) this.setState({
                            status: 'hover'
                        })
                    }}
                    onDragLeave={(e)=>{
                        e.preventDefault();
                        this.counter--;
                        if (!this.counter) this.setState({
                            status: 'inactive'
                        })
                    }}
                    onDrop={async (e)=>{
                        this.counter = 0;
                        e.preventDefault();
                        e.stopPropagation();
                        this.setState({
                            status: 'loading'
                        });
                        const items = Array.from(e.dataTransfer.items).map(item => item.webkitGetAsEntry())
                        const struct = await Promise.all(items.map((item,i)=>this.getTree(item,[i])));
                        struct.forEach((item,i) => {item.rootHeight = i});
                        store.initialize(struct);

                        this.setState({
                            status: 'loaded',
                            tree: true,
                        })
                    }}

                >

                    { this.renderTree() }
                    <TransitionGroup component={null}>
                        { this.renderFiller() }
                    </TransitionGroup>
                    <Overlay status={this.state.status}/>      
                </div>
            </div>
        )
    }
}