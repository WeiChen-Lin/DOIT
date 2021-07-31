/* 初瀏覽就拿cookie與後端API溝通用 */
function signInauto(){
    let requestUrl = "http://52.76.36.230:3000/api/sign";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            window.location.href = "http://52.76.36.230:3000/home"
        } else {
            window.location.href = "http://52.76.36.230:3000"
        }
    }
    request.open("GET", requestUrl, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

/* 登出用 */ 
function signOut(){
    let requestURL = "http://52.76.36.230:3000/api/sign";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status == 200){
            window.location.href = "http://52.76.36.230:3000";
        };
    };
    request.open("DELETE" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

const signout_but = document.querySelector("#signout");
signout_but.addEventListener("click", signOut);