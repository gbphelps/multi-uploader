
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

    function setAllChildrenBelow(idxs,delta){
        let collector = [];
        let entryChildren = state;
        for (let i=0; i<idxs.length; i++){
            const idx = idxs[i];
            collector = collector.concat(entryChildren.slice(idx+1))
            entryChildren = entryChildren[idx].children;
        }
        while (collector.length){
            const entry = collector.shift();
            entry.rootHeight += delta;
            subscriptions[JSON.stringify(entry.idxs)].setState({
                rootHeight: entry.rootHeight
            })

            if (entry.children && entry.expanded) collector = collector.concat(entry.children);
        }
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
            subscriptions[JSON.stringify(parents[i].idxs)].setState({
                visibleRows: parents[i].visibleRows,
            })
        }

        //set rootHeight for children: myheight + index + width
        let runningTally = entry.rootHeight + 1;
        for (let i=0; i<entry.children.length; i++){
            entry.children[i].rootHeight = runningTally;
            console.log(entry.children[i].idxs)
            //don't need to publish bc these items don't exist yet.
            runningTally += entry.children[i].visibleRows;
        }

        setAllChildrenBelow(idxs, newSize - oldSize);

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