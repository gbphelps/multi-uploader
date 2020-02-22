import configs from './styleConfigs';





class FakeXMLHttpRequest{
    constructor(){
        this.readyState = 0;
        this.status = 0;
        this.listeners = {};
    }
    addEventListener(type, cb){
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(cb);
    }

    onreadyStateChange(){}
    send(){
        this.readyState = 2;
        const total = Math.random() * 100 + 10;
        let loaded = 0;
        (function (){
            if (loaded === total){
                this.readyState = 4;
                this.listeners.loadend.forEach(l => l());
                return;
            }
            setTimeout(()=>{
                if (this.readyState !== 2) this.readyState = 2;
                loaded += Math.min(total-loaded, Math.random()*5);
                this.listeners.progress.forEach(l => l({
                  loaded,
                  total,
                  lengthComputable: true,
                }))
                _step();
            },(1-Math.random()*Math.random())*1000)
        })();
    }
    open(){
        this.readyState = 1;
    }
}







function createStore(){
    let state = [];

    let flatList = [];

    let totalHeight = 0;

    let subscriptions = [];
    let containerCB = null;

    function registerContainer(me){
        containerCB = me
    }

    async function initialize(items){
        state = await Promise.all(items.map((item,i)=>getTree(item,[i])));
        state.forEach((item,i) => {item.rootHeight = i});
        setTotalHeight(state.length);
    }

    function setTotalHeight(height){
        totalHeight = height;
        containerCB({
            height
        });  
    }

    function getState(){
        return state;
    }
    
    function getExpandedSize(entry){
        let size = 1;
        entry.children.forEach(child => {
            size += child.visibleRows;
        })
        return size;
    }


    function setStore(entry, partial){
        subscriptions[JSON.stringify(entry.idxs)].forEach(subscriber =>{
            subscriber.setState(partial);
        })
        Object.assign(entry, partial);
    }

    function setAllChildrenBelow(idxs,delta){
        //Set heights for visible nodes OUTSIDE OF (i.e. BELOW) the expansion event.
        let collector = [];
        let entryChildren = state;
        for (let i=0; i<idxs.length; i++){
            const idx = idxs[i];
            collector = collector.concat(entryChildren.slice(idx+1)) //get every node at this level that comes after the expanded element
            entryChildren = entryChildren[idx].children; //dig into the affected node
        }
        while (collector.length){
            // examine first node in the collector; edit rootHeight and publish.
            const entry = collector.shift();
            const rootHeight = entry.rootHeight + delta;
            setStore(entry, { rootHeight });

            // if this node is expanded, it means we're painting its children and need to edit their root height.
            // Add them to the queue, but ONLY if expanded (saves unnecessary computation for hidden elements).
            // if an element is currently hidden, its nodes will be updated WITHIN the expansion event.
            if (entry.children && entry.expanded) collector = collector.concat(entry.children);
        }
    }

    function toggle(idxs){
        //TODO - tell first parent that it's the one that needs to transition.
        let entry = state[idxs[0]];
        const parents = [];

        for (let i=1; i<idxs.length; i++){
            parents.unshift(entry);
            entry = entry.children[idxs[i]];
        }

        const expandedSize = getExpandedSize(entry);
        const newSize = entry.expanded ? 1 : expandedSize;
        const delta = entry.expanded ? 1 - expandedSize : expandedSize - 1;
  
        //set self
        setStore(entry,{
            visibleRows: newSize,
            expanded: !entry.expanded,
        })

        //set parents' visibleRows
        for (let i=0; i<parents.length; i++){
            let p = parents[i]
            setStore(p, {
                visibleRows: p.visibleRows + delta
            })
        }

        //set rootHeight for children
        let runningTally = entry.rootHeight + 1;
        for (let i=0; i<entry.children.length; i++){
            entry.children[i].rootHeight = runningTally;
            //NOTE: don't need to publish bc these items don't exist yet.
            runningTally += entry.children[i].visibleRows;
        }

        setAllChildrenBelow(idxs, delta);
        setTotalHeight(totalHeight + delta);
    }

    function registerNode(self, idxs){
        const key = JSON.stringify(idxs);
        if (!subscriptions[key]) subscriptions[key] = [];
        subscriptions[key].push(self);
    }

    function beginLoad(maxParallel = 20){
        return new Promise(r => {
            let nextIdx = 0;
            function _load(){
                if (nextIdx > flatList.length - 1){
                    r();
                    return;
                }

                const idx = nextIdx++;
                const { idxs } = flatList[idx];
                let entry = state[idxs[0]];
                for (let i=1; i<idxs.length; i++) entry = entry.children[idxs[i]];

                const req = new FakeXMLHttpRequest();
                req.open('POST', '__ENDPOINT__');
                req.addEventListener('progress', (e)=>{
                    setStore(entry,{
                        loadPercent: e.loaded / e.total,
                    })
                })
                req.addEventListener('loadend', _load);
            }

            for (let i=0; i<maxParallel; i++) _load();
        })
    }

    function getTree(item, idxs=[], finalIdxs=[]){
        const metadata = new Promise(r => {
            item.getMetadata(
                m => { r(m) }, 
                err => { 
                    console.log(err);
                    r({})
                }
            );
        })
    
        let treeData;
        if (item.isFile) {
            flatList.push({
                item,
                idxs
            })
            treeData = Promise.resolve({
                item,
                idxs,
                visibleRows: 1,
                rootHeight: -1,
                finalIdxs,
                numFiles: 1,
                loadPercent: 0,
            });
        } else {
            treeData = new Promise(resolve => {
                const r = item.createReader();
                r.readEntries((entries) => {
                    const promises = entries
                        .map((item,i) => {
                            return getTree(
                                item, 
                                idxs.concat([i]), 
                                finalIdxs.concat([i === entries.length - 1])
                            )
                        })
                    Promise.all(promises).then(result => {
                        resolve({
                            item,
                            children: result,
                            idxs,
                            expanded: false,
                            visibleRows: 1,
                            rootHeight: -1,
                            finalIdxs,
                            numFiles: result.reduce((acc,el) => acc + el.numFiles,0),
                            loadedFiles: 0,
                            bytes: result.reduce((acc,el) => acc + el.bytes, 0)
                        })
                    })
                }, () => {
                    console.error("This repo does not work locally. It must be served on localhost using `npm run serve`.")
                })
            })
        }
        
        const animationDelay = new Promise(r => {setTimeout(r,configs.OVERLAY_ANIMATION_DURATION*3)})
        return Promise.all([metadata, treeData, animationDelay])
            .then(([metadata, treeData]) => (
                Promise.resolve ({
                    modificationTime: metadata.modificationTime,
                    bytes: metadata.size,
                    ...treeData
                })
            )
        )
    }
    
    return { getState, initialize, toggle, registerNode, registerContainer }
}


const store = createStore();
window.store = store;
export default store;