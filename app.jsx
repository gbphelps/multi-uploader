import React from 'react';
import 'regenerator-runtime';
import Entry from './entry';

import store from './treeStore';
import configs from './styleConfigs';
import Overlay from './overlay';
import SideCar from './sideCar';


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
        store.registerContainer(this);
    }
    
    disable(e){
        e.preventDefault();
        e.stopPropagation();
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

    renderSidePanel(){
        if (!this.state.tree) return false;
        return store.getState().map((_,idx) => <SideCar key={idx} idxs={[idx]}/>)
    }


    render(){
        return (
            <div className="site-container">
                <div 
                    className={`uploader ${this.state.status}`}
                    style={{ height: configs.ROW_HEIGHT * configs.NUM_ROWS }}
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
                        await (store.initialize(items));
                        this.setState({
                            status: 'loaded',
                            tree: true,
                        })
                    }}
                >
                    <div className="file-tree">
                        { this.renderTree() }  
                        <TransitionGroup component={null}>
                            { this.renderFiller() }
                        </TransitionGroup>
                        <Overlay status={this.state.status}/>    
                    </div>
                    
                    <div className="sidecar">
                        { this.renderSidePanel() }   
                        <TransitionGroup component={null}>
                            { this.renderFiller() }
                        </TransitionGroup>
                    </div>

                </div>
            </div>
        )
    }
}