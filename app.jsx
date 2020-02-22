import React from 'react';
import 'regenerator-runtime';
import Entry from './entry';

import store from './treeStore';
import configs from './styleConfigs';
import Overlay from './overlay';
import SideCar from './sideCar';
import withHeightDiff from './withHeightDiff';
import LoadData from './loadData';

class Container extends React.Component {
    constructor(props){
        super(props);
        this.counter = 0;
        this.state = {
            status: 'inactive',
            incoming: {}
        }
    }
    
    disable(e){
        e.preventDefault();
        e.stopPropagation();
    }

    renderTree(){
        return store.getState().map((_,idx) => <Entry key={idx} idxs={[idx]}/>)
    }

    renderFiller(className){
        const { incoming, height } = this.props;
        const numRows = configs.NUM_ROWS - Math.min(incoming.height, height);

        const rows = [];
        for (let i=0; i<numRows; i++) rows.push(
            <div 
                key={i}
                className={`entry ${(incoming.height+i)%2 ? 'even' : 'odd'} ${className || ''}`}
                style={{ height: configs.ROW_HEIGHT }}
            />
        );
        return rows;
    }

    renderSidePanel(){
        return store.getState().map((_,idx) => <SideCar key={idx} idxs={[idx]}/>)
    }


    renderLoadData(){
        return store.getState().map((_,idx) => <LoadData key={idx} idxs={[idx]}/>)
    }

    setWithDiff(obj){
        this.setState(s => {
            const incoming = JSON.parse(JSON.stringify(s.incoming));
            Object.assign(incoming,obj);
            return { incoming }
        })
        setTimeout(()=>{
            this.setState(obj)
        },configs.OVERLAY_ANIMATION_DURATION)
    }


    render(){
        return (
            <div className="site-container">
                <div className="uploader-and-header">
                <div className="header" style={{height: configs.ROW_HEIGHT}}>
                    <div className="name">Name</div>
                    <div className="size">Size</div>
                    <div className="modified">Last Modified</div>
                </div>
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
                        this.setState({ status: 'loading' });
                        const items = Array.from(e.dataTransfer.items).map(item => item.webkitGetAsEntry())
                        await (store.initialize(items));
                        this.setState({ status: 'loaded' });
                    }}
                >
                    <div className="file-tree">
                        { this.renderTree() }  
                        { this.renderFiller() }    
                    </div>
                    
                    <div className="sidecar">
                        { this.renderSidePanel() }   
                        { this.renderFiller() }
                    </div>

                    {/* <div className="sidecar">
                        { this.renderLoadData() }   
                        { this.renderFiller('load-data') }
                    </div> */}


                    <Overlay status={this.state.status}/>
                </div>
                </div>
                <div style={{display: 'flex', paddingTop: 8}}>
                    <button onClick={()=>{
                        store.beginLoad()
                    }}>
                        Upload files
                    </button>
                </div>
                <svg height="0" width="0">
                    <defs>
                    <filter id="s">
                        <feDropShadow dy="4" dx="0" stdDeviation="4" floodOpacity=".2"></feDropShadow>
                    </filter>
                    </defs>
                </svg>
            </div>
        )
    }
}

export default withHeightDiff(Container);