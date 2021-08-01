/* 初瀏覽就拿cookie與後端API溝通用 */
function signInauto(){
    let requestUrl = domain_name + "/api/sign";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            window.location.href = domain_name + "/home"
        } else {
            window.location.href = domain_name + ""
        }
    }
    request.open("GET", requestUrl, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

/* 登出用 */ 
function signOut(){
    let requestURL = domain_name + "/api/sign";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status == 200){
            window.location.href = domain_name + "";
        };
    };
    request.open("DELETE" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

const signout_but = document.querySelector("#signout");
signout_but.addEventListener("click", signOut);