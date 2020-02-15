import React from 'react';
import 'regenerator-runtime';
import Entry from './entry';

import store from './treeStore';
import configs from './styleConfigs';
import Overlay from './overlay';
import SideCar from './sideCar';
import withHeightDiff from './withHeightDiff';

class Container extends React.Component {
    constructor(props){
        super(props);
        this.counter = 0;
        this.state = {
            status: 'inactive',
            tree: false,
        }
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
        const { incoming, height } = this.props;
        const numRows = configs.NUM_ROWS - Math.min(incoming.height, height);

        const rows = [];
        for (let i=0; i<numRows; i++) rows.push(
            <div 
                key={i}
                className={`entry ${(incoming.height+i)%2 ? 'even' : 'odd'}`}
                style={{ height: configs.ROW_HEIGHT }}
            />
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
                        { this.renderFiller() }
                        <Overlay status={this.state.status}/>    
                    </div>
                    
                    <div className="sidecar">
                        { this.renderSidePanel() }   
                        { this.renderFiller() }
                    </div>

                </div>
            </div>
        )
    }
}

export default withHeightDiff(Container);