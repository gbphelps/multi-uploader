import React from 'react';
import 'regenerator-runtime';
import Entry from './entry';

import store from './treeStore';
import configs from './styleConfigs';
import Overlay from './overlay';
import SideCar from './sideCar';
import withHeightDiff from './withHeightDiff';
import LoadData from './loadData';

import Bar from './bars';

class Container extends React.Component {
    constructor(props){
        super(props);
        this.counter = 0;
        this.state = {
            status: 'empty'
        }
    }

    disable(e){
        e.preventDefault();
        e.stopPropagation();
    }

    renderTree(){
        return store.getState().children.map((_,idx) => <Entry key={idx} idxs={[idx]}/>)
    }

    renderFiller(className){
        const { incoming, visibleRows } = this.props;
        const numRows = configs.NUM_ROWS - Math.min(incoming.visibleRows, visibleRows);

        const rows = [];
        for (let i=0; i<numRows; i++) rows.push(
            <div 
                key={i}
                className={`entry ${(incoming.visibleRows+i)%2 ? 'even' : 'odd'} ${className || ''}`}
                style={{ height: configs.ROW_HEIGHT }}
            />
        );
        return rows;
    }

    renderSidePanel(){
        return store.getState().children.map((_,idx) => <SideCar key={idx} idxs={[idx]}/>)
    }

    renderBars(){
        return store.getState().children.map((_,idx) => <Bar key={idx} idxs={[idx]}/>)
    }


    renderLoadData(){
        return store.getState().children.map((_,idx) => <LoadData key={idx} idxs={[idx]}/>)
    }

    getOverlayStatus(){
        if (this.state.status === 'uploadComplete'){
            return store.getErrors().length ? 'done-error' : 'done-success'
        }
        return this.state.status
    }

    render(){
        return (
            <div className="site-container">
                <div className={`uploader-and-header ${this.state.status}`}>
                    <div className="header-container">
                        <div className="header" style={{height: configs.ROW_HEIGHT, width: '100%'}}>
                            <div className="name">Name</div>
                            <div className="size">Size</div>
                            <div className="modified">Last Modified</div>
                        </div>
                        <div className={`header ${this.props.incoming.loadStarted ? '' : 'retracted'}`} style={{height: configs.ROW_HEIGHT, position: 'absolute', right: 0, width: 'unset'}}>
                            <div className="load-progress-header">Data Loaded</div>
                            <div className="load-files-header"># Files</div>
                        </div>
                    </div>
                
                <div className="drop-zone"
                    style={{position: 'relative'}}
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
                            status: store.getState().children.length ? 'inactive' : 'empty'
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
                <div 
                    className={`file-data ${this.state.status}`}
                    style={{ height: configs.ROW_HEIGHT * configs.NUM_ROWS, overflowX: 'hidden' }}
                >
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                        }}>
                            { this.renderBars() }  
                            { this.renderFiller() }    
                        </div>

                        <div className="file-tree" style={{
                            width: `calc(100% - ${this.props.incoming.loadStarted ? '340px' : '300px' })`,
                            overflowX: 'scroll'
                        }}>
                            { this.renderTree() }  
                            { this.renderFiller() }    
                        </div>
                        
                        <div className="sidecar">
                            { this.renderSidePanel() }   
                            { this.renderFiller() }
                        </div>

                        <div className={`sidecar ${this.props.incoming.loadStarted ? '' : 'retracted'}`}>
                            { this.renderLoadData() }   
                            { this.renderFiller('load-data') }
                        </div>
  

                    
                </div>
                <Overlay status={this.getOverlayStatus()}/>
                </div>

                <div className="bottom-bar-container">
                    <div className={this.state.status === 'uploadStarted' || this.state.status === "uploadComplete" ? 'retracted bottom-bar' : 'bottom-bar'} style={{
                            display: 'flex',
                    }}>
                    <button className="red" onClick={()=>{
                        store.clearAll()
                    }}>
                    <div className="little-icon" style={{fontFamily: 'monospace'}}>&times;</div>
                        Clear all
                    </button>

                    <label htmlFor="upload-more">
                        <div className="button green">
                            <div className="little-icon" style={{fontFamily: 'monospace'}}>+</div>
                            Add files
                        </div>
                        <input 
                            id="upload-more"
                            name="upload-more"
                            style={{
                                position: 'absolute',
                                visibility: 'hidden'
                            }}
                            type="file" 
                            multiple 
                            directory="true"
                            webkitdirectory="true"
                            mozdirectory="true"
                            msdirectory="true"
                            odirectory="true"
                            onChange={async e => {
                                this.setState({
                                    status: "loading"
                                });
                                const files = Array.from(e.target.files);
                                e.target.value = null;
                                await store.initFromInput(files);
                                this.setState({
                                    status: 'loaded'
                                })
                            }}
                        />
                    </label>
                        { !!store.getState().children.length &&
                            <button onClick={async ()=>{
                                this.setState({
                                    status: 'uploadStarted'
                                })
                                await store.beginLoad();
                                this.setState({
                                    status: 'uploadComplete'
                                })
                            }}>
                                <div className="little-icon" style={{fontSize: 14, fontWeight: 500}}>&uarr;</div>
                                Finish &amp; upload
                            </button>
                        }    
                    </div>

                    <div className={`all-progress ${this.props.incoming.loadStarted ? '' : 'retracted'}`}>
                        <div style={{
                            height: '100%', 
                            width: this.props.incoming.loadAmt/this.props.incoming.bytes*100+"%", 
                            background: 'mediumseagreen',
                            boxShadow: '0 1px 0 0 rgba(0,0,0,.2)',
                            borderRadius: 1000,
                        }}/>
                    </div>
                </div>
                </div>
                
                <svg height="0" width="0">
                    <defs>
                    <filter id="s">
                        <feDropShadow dy="4" dx="0" stdDeviation="4" floodOpacity=".2"></feDropShadow>
                    </filter>
                    <filter id="s2">
                        <feDropShadow dy="-1" dx="0" stdDeviation="0" floodOpacity=".5"></feDropShadow>
                    </filter>
                    </defs>
                </svg>
            </div>
        )
    }
}

export default withHeightDiff(Container);