import React from 'react';
import Sonar from './sonar';
import 'regenerator-runtime';
import Entry from './entry';

import store from './treeStore';
import configs from './styleConfigs';

export default class extends React.Component {
    constructor(props){
        super(props);
        this.counter = 0;
        this.state = {
            status: 'inactive',
            tree: false,
            height: 0,
            prevHeight: null,
        }
        this.getTree = this.getTree.bind(this);
        store.registerContainer(this);
    }
    
    disable(e){
        e.preventDefault();
        e.stopPropagation();
    }

    componentDidUpdate(_, prevState){
        if (this.state.prevHeight !== null && prevState.prevHeight === null) setTimeout(()=>{
            console.log('reset')
            this.setState({prevHeight: null})
        }, configs.ANIMATION_DURATION)
    }

    getTree(item, idxs=[]){
        if (item.isFile) return Promise.resolve({
            item,
            idxs,
            visibleRows: 1,
            rootHeight: -1,
        });
        
        return new Promise(resolve => {
            const r = item.createReader();
            r.readEntries((entries) => {
                const promises = entries
                    .map((item,i) => {
                        return this.getTree(item, idxs.concat([i]))
                    })
                Promise.all(promises).then(result => {
                    resolve({
                        item,
                        children: result,
                        idxs,
                        expanded: false,
                        visibleRows: 1,
                        rootHeight: -1,
                    })
                })
            }, () => {
                console.error("This repo does not work locally. It must be served on localhost using `npm run serve`.")
            })
        })
    }


    renderTree(){
        if (!this.state.tree) return false;
        return store.getState().map((_,idx) => <Entry idxs={[idx]}/>)
    }

    renderFiller(){
        const { height, prevHeight } = this.state;
        const sub = prevHeight != null && prevHeight < height ? prevHeight : height;
        const numRows = configs.NUM_ROWS - sub;
        console.log({prevHeight, numRows});

        const rows = [];
        for (let i=0; i<numRows; i++) rows.push(
            <div 
                className={`entry ${(height+i)%2 ? 'even' : 'odd'}`}
                style={{ height: configs.ROW_HEIGHT }}
            />
        );
        return rows;
    }


    render(){
        return (
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
                    this.setState({
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
                { this.renderFiller() }

                <div className="overlay"> 
                    <Sonar 
                        killed={this.state.status !== 'hover'} 
                        interval={.3}
                        pulseNum={2}
                    />
                    <div className="temp-status">
                        <svg className="dropper" viewBox="-30 -30 60 60" height="30" stroke="white" stroke-width="10">
                            <line stroke-linecap="round" y1="-25" y2="25"/>
                            <line stroke-linecap="round" x1="-25" x2="25"/>
                        </svg>
                        <div className="loader">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}