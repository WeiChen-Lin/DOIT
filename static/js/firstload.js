/* 初瀏覽就拿cookie與後端API溝通用 */
function signInauto(){
    let requestUrl = "https://doitouob.com/api/sign";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            window.location.href = "https://doitouob.com/home"
        } else {
            window.location.href = "https://doitouob.com"
        }
    }
    request.open("GET", requestUrl, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

/* 登出用 */ 
function signOut(){
    let requestURL = "https://doitouob.com/api/sign";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status == 200){
            window.location.href = "https://doitouob.com";
        };
    };
    request.open("DELETE" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

const signout_but = document.querySelector("#signout");
signout_but.addEventListener("click", signOut);