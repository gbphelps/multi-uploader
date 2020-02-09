let uploader;

function setup(){
    uploader = document.getElementsByClassName('uploader')[0];
    [
        'drag',
        'dragend',
        'dragenter',
        'dragexit',
        'dragleave',
        'dragover',
        'dragstart',
        'drop'
    ].forEach(etype => {
        uploader.addEventListener(etype, e=>{
            e.preventDefault();
            e.stopPropagation();
        })
    });

    uploader.addEventListener('dragenter',(e)=>{
        uploader.classList.add('hover');
    });

    let i = 0;
    uploader.addEventListener('drop', async (e) => {
        i = 0;
        uploader.classList.remove('hover');

        const items = Array.from(e.dataTransfer.items).map(item => item.webkitGetAsEntry());
        setSpinner(true);
        const directory = await Promise.all(items.map(getTree)).then(items => {console.log(items)});
        setSpinner(false);
    })

    uploader.addEventListener('dragleave',()=>{
        i--;
        if (!i) uploader.classList.remove('hover');
    })
    uploader.addEventListener('dragenter', ()=>{
        i++;
    })

}


function setSpinner(on){
   if (on) {
       uploader.classList.add('loading')
   } else {
       uploader.classList.remove('loading') 
   }
}



function getTree(item){
    if (item.isFile){
        return Promise.resolve(item);
    } else {
        return new Promise(resolve => {
            const r = item.createReader();
            r.readEntries(
                entries => resolve(Promise.all(entries.map(getTree)))
            )
        })
    }
}

document.addEventListener('DOMContentLoaded',setup);


