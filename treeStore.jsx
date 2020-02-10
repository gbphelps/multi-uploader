
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
        // let frontier = [entry];
        // let size = 0;
        // while (frontier.length) {
        //     entry = frontier.shift();
        //     size++;
        //     if (!entry.item.isFile && entry.expanded) {
        //         frontier = frontier.concat(entry.children);
        //     }
        // }
        // return size;
        let size = 1;
        if (!entry.expanded) return size;

        entry.children.forEach(child => {
            size += child.visibleRows;
        })
        return size;
    }

    function toggle(idxs){
        let entry = state[idxs[0]];
        const parents = [entry];

        for (let i=1; i<idxs.length; i++){
            entry = entry.children[idxs[i]];
            parents.unshift(entry);
        }

        //TODO: for some reason this bugs out unless I set twice? ook at the visibleRows console log, that seems to be part of the problem rather than React maybe?

        const oldSize = getSize(entry);
        entry.expanded = !entry.expanded;
        const newSize = getSize(entry);

        subscriptions[JSON.stringify(idxs)].setState({
            open: entry.expanded,
            visibleRows: newSize,
        })

        for (let i=0; i<parents.length; i++){
            parents[i].visibleRows += newSize - oldSize;
            console.log(parents[i].visibleRows);
            
            const indexes = [idxs[0]].concat(parents[i].idxs);

            subscriptions[JSON.stringify(indexes)].setState({
                visibleRows: parents[i].visibleRows,
            })
        }
    }

    function subscribe(self, idxs){
        subscriptions[JSON.stringify(idxs)] = self;
    }

    return { getState, initialize, toggle, subscribe }
}


const store = createStore();
window.store = store;
export default store;