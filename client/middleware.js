window.onload = localStorage.getItem("boardName");

//Append board name to url after page loaded.
window.history.replaceState(null, null, localStorage.getItem("boardName"))
let url = 'https://we7btpj0ue.execute-api.ap-southeast-2.amazonaws.com/prod/board'

function go() {
    console.log("go")
    var value = document.forms[0].elements["name"].value;
    value = escape(value);
    //Load index.html after name entered and go button clicked.
    //window.location.href = "index.html";
    localStorage.setItem("boardName", value);
    return false;
}


function postBoardName(){
    let board = "A board"
    
    //  let _data = {
        
    //      body:board
    // //     //window.location.pathname
    // }
//    var header = new Header();
//    header.append('Content-type','application/json; charset=UTF-8');
//    header.append('Access-Control-Allow-Origin' , '*');

alert(typeof(board));
 
    fetch(url, {
        method: 'POST',
       body: board,
        headers: {
            'Content-type':'application/json',
        'Access-Control-Allow-Origin' : '*'
                },
                mode: 'no-cors' 
    }
    )
   
    .then(response => {response.text()})
    .catch(err => console.log(err));
   
}

function getBoards() {


    // fetch(url)
    //     .then(response => response.text())
    //     .then(json => {console.log(JSON.stringify(json))})

}