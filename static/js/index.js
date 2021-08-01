/* 參數區 */
// 登入登出區塊
const signinbox = document.querySelector("body > div.signbox > div.signIn");
const signupbox = document.querySelector("body > div.signbox > div.signUp");
const signUpbut = document.querySelector("body > div.signbox > div.signUp > form > div.signbut > button")
const signInbut = document.querySelector("body > div.signbox > div.signIn > form > div.signbut > button");
const signInInput = document.querySelector("body > div.signbox > div.signIn > form > div:nth-child(3) > input[type=password]");
/* 控制登入及登出的畫面切換 */
function signboxChange(){
    if(signinbox.style.display == ""){
        signinbox.style.display = "none";
        signupbox.style.display = "block";
    } else if(signinbox.style.display == "block"){
        signinbox.style.display = "none";
        signupbox.style.display = "block";
    } else if(signinbox.style.display == "none"){
        signinbox.style.display = "block";
        signupbox.style.display = "none";
    }
};

const changeBut = document.querySelectorAll("#Tosignup");
changeBut.forEach(ele => {
    ele.addEventListener("click", signboxChange);
});

/*前端驗證完要註冊之帳號密碼後，以此處函數控制輸入框變色*/
/* 取得Do it!平台註冊資料，並做檢查機制 */
/* 此為取得表單資料定義函數 */
function getform(position){
    let form = new FormData(position);
    let obj = {};
    for (let key of form.keys() ) {
        obj[key] = form.get(key);
    }
    return obj;
};

/* 此為取得註冊表單，並檢查 */
/* 想以email及password輸入完後直接檢查，先命名變數 */
const email_site = document.querySelector("body > div.signbox > div.signUp > form > div:nth-child(2) > input[type=text]");
const password_site = document.querySelector("body > div.signbox > div.signUp > form > div:nth-child(4) > input[type=password]");
const username_site = document.querySelector("body > div.signbox > div.signUp > form > div:nth-child(3) > input[type=text]");
let email_check = false;
let password_check = false;
let button_check = false;

/* email位置做檢查 */
email_site.addEventListener("change", ()=>{
    let email_re = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if(email_re.test(email_site.value)){
        email_site.style.border = "2px rgb(9, 255, 0) solid";
        email_check = true;
        CheckSignUp();
    } else {
        email_site.style.border = "2px red solid";
        email_check = false;
        CheckSignUp();
    }
});

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

/* 兩個欄位都對的話，讓註冊的按鈕生效 */
function CheckSignUp(){
    let but_site = document.querySelector("body > div.signbox > div.signUp > form > div.signbut");
    if(email_check && password_check){
        but_site.style.backgroundColor = "rgb(122, 236, 150)";
        button_check = true;
        but_site.addEventListener("click", postToAPI);
    } else {
        but_site.style.backgroundColor = "gray";
        if(button_check){
            but_site.removeEventListener("click", postToAPI);
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

            } else if(json.error == 2){

                email_site.style.border = "1px red solid";
                email_check = false;
                drawSignError(email_site, "Repeat email");
                CheckSignUp();

            } else if(json.error ==3){

                email_site.style.border = "1px red solid";
                email_check = false;
                drawSignError(email_site, "Invalid email format");
                CheckSignUp();

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

/* Do it! 本身平台登入 */
signInbut.addEventListener("click", DoitSignIn);
function DoitSignIn(){
    let data = getform(document.querySelector("body > div.signbox > div.signIn > form"));
    data.loginRoute = 1;
    let data_to_python = JSON.stringify(data);
    let requestUrl = domain_name + "/api/sign"
    let request = new XMLHttpRequest();
    let load_site = document.querySelector("body > div.signbox > div.signIn > form > div.signbut > button");
    load_site.textContent = "";
    loaderIcon(load_site, 48);
    request.onload = function(){
        if(request.status == 200){
            window.location.href = domain_name + "/home"
        } else {
            load_site.textContent = "Log In"
            closeIcon(load_site);
            drawSignError(signInInput, "Invalid email or password");
        }
    }
    request.open("PATCH", requestUrl, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}