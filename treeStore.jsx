
function createStore(){
    let state = null;

    let subscriptions = [];

    function initialize(tree){
        state = tree;
    }

    function getState(){
        return state;
    }
    
    function getSize(entry){
        let size = 1;
        if (!entry.expanded) return size;

        entry.children.forEach(child => {
            size += child.visibleRows;
        })
        return size;
    }

    function toggle(idxs){
        let entry = state[idxs[0]];
        const parents = [];

        for (let i=1; i<idxs.length; i++){
            parents.unshift(entry);
            entry = entry.children[idxs[i]];
        }

        const oldSize = getSize(entry);
        entry.expanded = !entry.expanded;
        const newSize = getSize(entry);
        entry.visibleRows = newSize;
        //TODO clean this up

        console.log(parents.map(p => p.visibleRows));

        //set parents' visibleRows
        for (let i=0; i<parents.length; i++){
            parents[i].visibleRows += newSize - oldSize;
            const indexes = [idxs[0]].concat(parents[i].idxs);
            subscriptions[JSON.stringify(indexes)].setState({
                visibleRows: parents[i].visibleRows,
            })
        }

        //set root

        //set self
        subscriptions[JSON.stringify(idxs)].setState({
            open: entry.expanded,
            visibleRows: newSize,
        })
    }

    function subscribe(self, idxs){
        subscriptions[JSON.stringify(idxs)] = self;
    }

    return { getState, initialize, toggle, subscribe }
}


const store = createStore();
window.store = store;
export default store;