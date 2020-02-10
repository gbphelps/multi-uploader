
function createStore(){
    let state = null;

    function initialize(tree){
        state = tree;
    }

    function getState(){
        return state;
    }

    return { getState, initialize }
}

export default createStore();