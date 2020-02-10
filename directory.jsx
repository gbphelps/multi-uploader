import React from 'react';
import File from './file';

export default class Directory extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            open: false,
        }
    }

    renderChild(child){
        if (child.item.isFile) return <File data={child}/>
        return <Directory data={child}/>
    }

    render(){
        return (<>
            <div className="entry"
                onClick={()=>{
                    this.setState(s => ({ open: !s.open }))
                }}
            >
                { this.props.data.item.name }
            </div>
            <div className={this.state.open ? "dir open" : "dir closed"}>
                { this.props.data.children.map(this.renderChild) }
            </div>
        </>)
    }
}