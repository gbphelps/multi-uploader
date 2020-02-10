
function createStore(){
    let state = null;

    let subscriptions = [];

    function initialize(tree){
        state = tree;
    }

    function getState(){
        return state;
    }

    function toggle(idxs){
        let item = state[idxs[0]];
        for (let i=1; i<idxs.length; i++) item = item.children[idxs[i]];
        item.expanded = !item.expanded;
        subscriptions[JSON.stringify(idxs)].setState({
            open: item.expanded
        })
    }

    function subscribe(self, idxs){
        subscriptions[JSON.stringify(idxs)] = self;
    }

    return { getState, initialize, toggle, subscribe }
}

export default createStore();