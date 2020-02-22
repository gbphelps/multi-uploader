import React from 'react';
import store from './treeStore';
import configs from './styleConfigs';


// TransitionGroup was breaking on `renderFiller` - 
// disappearing rows did not update to new height.
// this prop provides new props in an `incoming` key before
// they replace the old props. Currently only using this for
// `height`, but can extend this logic to other subscribing
// components as necessary.

export default function withDiff(Component) {
    return class extends React.Component {
        constructor(props){
            super(props)
            this.state = {
                height: 0,
                incoming: {
                    height: 0,
                },
            } 
            store.registerContainer((incoming)=>{
                this.setState(s => {
                    const newIncoming = JSON.parse(JSON.stringify(s.incoming));
                    Object.assign(newIncoming, incoming);
                    return { incoming: newIncoming }
                })
                setTimeout(()=>{
                    this.setState(incoming)
                }, configs.ANIMATION_DURATION)
            });
        }
        render(){
            return <Component {...this.props} {...this.state}/>
        }
    }
}