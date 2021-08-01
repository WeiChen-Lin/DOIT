let password_check = false;
const password_site = document.querySelector("body > div.signbox > div > form > div:nth-child(4) > input[type=password]");
const username_site = document.querySelector("body > div.signbox > div > form > div:nth-child(3) > input[type=text]");
/* 密碼處做檢查 */
password_site.addEventListener("change", ()=>{
    let pwd_re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if(pwd_re.test(password_site.value)){
        password_site.style.border = "2px rgb(9, 255, 0) solid";
        password_check = true;
        CheckSignUp();
    } else {
        password_site.style.border = "2px red solid";
        password_check = false;
        CheckSignUp();
    }
});

function getform(position){
    let form = new FormData(position);
    let obj = {};
    for (let key of form.keys() ) {
        obj[key] = form.get(key);
    }
    return obj;
};

/* 兩個欄位都對的話，讓註冊的按鈕生效 */
function CheckSignUp(){
    let changebut = document.querySelector("body > div.signbox > div.signUp > form > div.signbut");
    if(password_check){
        changebut.style.backgroundColor = "rgb(122, 236, 150)";
        button_check = true;
        changebut.addEventListener("click", postToAPI);
    } else {
        changebut.style.backgroundColor = "gray";
        if(button_check){
            changebut.removeEventListener("click", postToAPI);
        }
    }
}

/* 取得表單資料，並且對後端API做註冊POST */
function postToAPI(){
    let data = getform(document.querySelector("body > div.signbox > div.signUp > form"));
    data.loginRoute = 1;
    let data_to_python = JSON.stringify(data);
    let requestUrl = domain_name + "/api/sign"
    let request = new XMLHttpRequest();
    signUpbut.textContent = "";
    loaderIcon(signUpbut, 48);
    request.onload = function(){
        if(request.status == 200){
            window.location.href = domain_name + "/home"
        } else {
            /* 清除錯誤訊息 */
            clearSignError();
            
            /* loading動畫關閉 */
            signUpbut.textContent = "Sign Up";
            closeIcon(signUpbut);
            

            let json = JSON.parse(request.responseText);
            if(json.error == 1){
                username_site.style.border = "1px red solid";
                drawSignError(username_site, "Repeat username")

            } else if(json.error == 4){

                password_site.style.borderBottom = "2px red solid";
                password_check = false;
                drawSignError(email_site, "Invalid password format")
                CheckSignUp();
            }
        }
    }
    request.open("POST", requestUrl, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

/* 繪出錯誤訊息 */ 
function drawSignError(site, error){
    let p = document.createElement("p");
    p.className = "error_message";
    p.style.color = "red";
    let p_error = document.createTextNode(error);
    p.appendChild(p_error);
    site.parentNode.appendChild(p);
}

/* 清除錯誤訊息 */
function clearSignError(){
    let error = document.getElementsByClassName("error_message");
    if(error){
        for(let i = 0; i < error.length; i++){
            error[i].parentNode.removeChild(error[i]);
        }
    }
}
