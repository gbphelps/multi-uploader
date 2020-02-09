import React from 'react';
import Sonar from './sonar';
import 'regenerator-runtime';

export default class extends React.Component {
    constructor(props){
        super(props);
        this.counter = 0;
        this.state = {
            status: 'inactive',
            tree: null,
        }
        this.getTree = this.getTree.bind(this)
    }
    
    disable(e){
        e.preventDefault();
        e.stopPropagation();
    }

    getTree(item){
        if (item.isFile){
            return Promise.resolve(item);
        } else {
            return new Promise(resolve => {
                const r = item.createReader();
                r.readEntries(
                    entries => resolve(Promise.all(entries.map(this.getTree)))
                )
            })
        }
    }

    render(){
        return (
            <div 
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
                    const struct = await Promise.all(items.map(this.getTree));
                    this.setState({
                        status: 'loaded',
                        tree: struct
                    })
                }}

            >
            <div className="upload-active">
                <Sonar 
                    killed={this.state.status !== 'hover'} 
                    interval={.3}
                    pulseNum={2}
                />

                <div id="files">
                </div>

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