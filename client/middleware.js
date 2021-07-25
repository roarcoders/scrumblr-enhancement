window.onload = localStorage.getItem("boardName");

//Append board name to url after page loaded.
window.history.replaceState(null, null, localStorage.getItem("boardName"))

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
    alert("postBoardName");
    // let _data = {
    //     boardId:"123",
    //     //body:localStorage.getItem("boardName")
    // }
let url = 'https://sv87lzli5d.execute-api.ap-southeast-2.amazonaws.com/prod/board'
    fetch(url, {
        method: 'POST',
        //body: JSON.stringify(_data),
        headers: {'Content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin' : '*'
    }
    })
    .then(response => console.log(response.json()))
    .catch(err => console.log(err));
}