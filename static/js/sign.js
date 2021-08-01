/* FB登入api串接 */
function init(){
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '969310010551786',
            cookie     : true,
            xfbml      : true,
            version    : 'v11.0'
    });   
        FB.AppEvents.logPageView();   
    };
    
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "http://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    
    let FBbut = document.getElementsByClassName("fb")[0];
    FBbut.addEventListener("click", ()=>{
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        }); 
    })
}

init();

function statusChangeCallback(response){
    //這位用戶已登入 Facebook，但尚未登入您的網頁。
    if(response.status === "not_authorized"){
        FB.login(function(response){
            if(response.status === "connected"){
                FB.api("/me?fields=id,name,email", function(response){
                    let data = {};
                    data.userID = response.id;
                    data.userName = response.name;
                    data.userEmail = response.email;
                    data.loginRoute = 0;
                    let data_to_python = JSON.stringify(data);
                    let requestUrl = "https://doitouob.com/api/sign"
                    let request = new XMLHttpRequest();
                    request.onload = function(){
                        if(request.status == 200){
                            window.location.href = "https://doitouob.com/home"
                        }
                    }
                    request.open("POST", requestUrl, true);
                    request.setRequestHeader('content-type', 'application/json');
                    request.send(data_to_python);
                })
            }
        })
    } //這位用戶已登入 Facebook，且已登入您的網頁。
    else if (response.status === "connected"){
        FB.api("/me?fields=id,name,email", function(response){
            let data = {};
            data.userID = response.id;
            data.userName = response.name;
            data.userEmail = response.email;
            data.loginRoute = 0;
            let data_to_python = JSON.stringify(data);
            let requestUrl = "https://doitouob.com/api/sign"
            let request = new XMLHttpRequest();
            request.onload = function(){
                if(request.status == 200){
                    window.location.href = "https://doitouob.com/home";
                }
            }
            request.open("PATCH", requestUrl, true);
            request.setRequestHeader('content-type', 'application/json');
            request.send(data_to_python);
        })
    } //這位用戶未登入 Facebook，因此無法得知對方是否已登入您的網頁；或者之前已呼叫 FB.logout()，因此無法連結至 Facebook。
    else {
        FB.login(function(response) {
            if (response.status === 'connected') {
                FB.api("/me?fields=id,name,email", function(response){
                    let data = {};
                    data.userID = response.id;
                    data.userName = response.name;
                    data.userEmail = response.email;
                    data.loginRoute = 0;
                    let data_to_python = JSON.stringify(data);
                    let requestUrl = "https://doitouob.com/api/sign"
                    let request = new XMLHttpRequest();
                    request.onload = function(){
                        if(request.status == 200){
                            window.location.href = "https://doitouob.com/home";
                        }
                    }
                    request.open("POST", requestUrl, true);
                    request.setRequestHeader('content-type', 'application/json');
                    request.send(data_to_python);
                })
            }
        });
    }
}

/* 初瀏覽就拿cookie與後端API溝通用 */
function signInauto(){
    let requestUrl = "https://doitouob.com/api/sign";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            window.location.href = "https://doitouob.com/home"
        }
    }
    request.open("GET", requestUrl, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}