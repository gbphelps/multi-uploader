import configs from './styleConfigs';
import _ from 'lodash';




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
    send(body){
        this.readyState = 2;
        const total = body.bytes;
        let loaded = 0;
        const _step = () => {
            if (loaded === total){
                this.readyState = 4;
                this.listeners.loadend.forEach(l => l());
                return;
            }
            if (Math.random() < configs.FAIL_RATE){
                this.listeners.error.forEach(l => l())
                return;
            }
            
            setTimeout(()=>{
                if (this.readyState !== 2) this.readyState = 2;
                loaded += Math.min(total-loaded, Math.random()*100000);
                this.listeners.progress.forEach(l => l({
                  loaded,
                  total,
                  lengthComputable: true,
                }))
                _step();
            },Math.random()*1000)
        };
        _step();
    }
    open(){
        this.readyState = 1;
    }
}







function createStore(){
    let state = [];

    let flatList = [];

    let totalHeight = 0;
    let loadState = 'not-loading';

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


    function initFromInput(items){
        const directories = {};
        Array.from(items).forEach(i => {
            const path = i.webkitRelativePath.split('/');
            let idxs = [];
            path.reduce((acc,el) => {
                if (!acc[el]){
                    idxs.push(Object.keys(acc).length)
                    acc[el] = {
                        numFiles: 0,
                        bytes: 0,
                        children: {},
                        idxs,
                    };
                } 
                acc[el].numFiles++;
                acc[el].bytes += i.size;
                idxs = acc[el].idxs.slice();
                return acc[el].children;
            },directories);
        })
        function arrify(obj){
            return Object.keys(obj).map((key,i) => {
                return {
                    name: key,
                    numFiles: obj[key].numFiles,
                    bytes: obj[key].bytes,
                    children: arrify(obj[key].children),
                    rootHeight: -1,
                    visibleRows: 1,
                    expanded: false,
                    loadAmt: 0,
                    loadedFiles: 0,
                    loadError: false,
                    loadStarted: obj[key].numFiles === 0,
                    loaded: obj[key].numFiles === 0,
                    idxs: obj[key].idxs,
                    // item,
                    // finalIdxs,
                }
            }).sort((a,b) => {
                a.idxs
            })
        }
        console.log(arrify(directories))
    } 

    function setTotalHeight(height){
        totalHeight = height;
        containerCB({ loadState, height });  
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
        const subs = subscriptions[JSON.stringify(entry.idxs)];

        const prevState = entry;
        const nextState = Object.assign({},entry,partial);

        if (subs) subs.forEach(subscriber=>{
            subscriber(nextState, prevState)
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

    function registerNode(self, idxs, keys){
        const key = JSON.stringify(idxs);
        if (!subscriptions[key]) subscriptions[key] = [];
        subscriptions[key].push((newState, prevState)=>{
            let execute = false;
            for (let i=0; i<keys.length; i++){
                if (newState[keys[i]] !== prevState[keys[i]]){
                    execute = true;
                    break;
                } else {
                    continue;
                }
            }
            if (execute) {
                self.setState(_.pick(newState, keys))
            }
        });
    }

    function beginLoad(maxParallel = 10){
        loadState = 'loading';
        containerCB({ loadState, height: totalHeight });
        return new Promise(r => {
            let nextIdx = 0;
            function _load(){
                if (nextIdx > flatList.length - 1){
                    r();
                    return;
                }

                const idx = nextIdx++;
                const { idxs } = flatList[idx];
                const ancestors = [];
                let entry = state[idxs[0]];
                ancestors.push(entry);
                for (let i=1; i<idxs.length; i++){
                    entry = entry.children[idxs[i]];
                    ancestors.push(entry);
                } 

                ancestors.forEach(ancestor => {
                    setStore(ancestor, { 
                        loadStarted: true 
                    })
                })

                const req = new FakeXMLHttpRequest();
                req.open('POST', '__ENDPOINT__');

                req.addEventListener('progress', (e)=>{
                    const delta = e.loaded - entry.loadAmt;
                    ancestors.forEach(ancestor => {
                        setStore(ancestor,{
                            loadAmt: ancestor.loadAmt + delta,
                        })
                    })
                })
                req.addEventListener('loadend', ()=>{
                    ancestors.forEach(ancestor => {
                        setStore(ancestor, {
                            loadedFiles: ancestor.loadedFiles + 1,
                            loaded: ancestor.loadedFiles + 1 === ancestor.numFiles,
                        })
                    })
                    _load(); //move to next
                });

                req.addEventListener('error', ()=>{
                    ancestors.forEach(ancestor => {
                        setStore(ancestor, {
                            loadError: true,
                        })
                    })
                    _load(); //move to next
                })
                req.send(entry);
            }

            for (let i=0; i<maxParallel; i++) _load();
        })
    } 

    function getTree(item, idxs=[], finalIdxs=[]){
        const metadata = new Promise(r => {
            item.getMetadata(
                m => { r(m) }, 
                _err => { 
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
                loadAmt: 0,
                loadStarted: false,
                loadedFiles: 0,
                loaded: false,
                loadError: false,
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
                        const numFiles = result.reduce((acc,el) => acc + el.numFiles,0)
                        resolve({
                            item,
                            children: result,
                            idxs,
                            expanded: false,
                            visibleRows: 1,
                            rootHeight: -1,
                            finalIdxs,
                            numFiles,
                            loadedFiles: 0,
                            bytes: result.reduce((acc,el) => acc + el.bytes, 0),
                            loadAmt: 0,
                            loadStarted: numFiles === 0,
                            loaded: numFiles === 0,
                            loadError: false,
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
    
    return { getState, initialize, initFromInput, toggle, registerNode, registerContainer, beginLoad }
}


const store = createStore();
window.store = store;
export default store;