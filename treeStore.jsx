
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
        const parents = [];

        for (let i=1; i<idxs.length; i++){
            parents.push(item)
            item = item.children[idxs[i]];
        }
        
        //TODO: iterate item to get length based on expanded children.
        // then, publish this child's new length to all parents in the `parents` array.
        console.log(parents);

         //TODO - not quite this simple - need to check expanded state of all children.
        // parents.forEach((p,i) => { 
        //     p.lines += item.children.length;
        //     const parentIdxs = JSON.stringify(idxs.slice(0,i+1));
        //     subscriptions[parentIdxs].setState({
        //         lines: p.lines,
        //     })
        // });

        item.expanded = !item.expanded;
        subscriptions[JSON.stringify(idxs)].setState({
            open: item.expanded,

        })


    }

    function subscribe(self, idxs){
        subscriptions[JSON.stringify(idxs)] = self;
    }

    return { getState, initialize, toggle, subscribe }
}

export default createStore();