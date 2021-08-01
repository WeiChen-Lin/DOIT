let password_check = false;
let password_site = document.querySelector("body > div.signbox > div.signUp > form > div:nth-child(4) > input[type=password]");

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
    data.userEmail = document.querySelector("body > div.signbox > div > form > div.email").textContent;
    data.teamID = teamID;
    let data_to_python = JSON.stringify(data);
    let requestUrl = "https://doitouob.com/api/mail"
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            window.location.href = "https://doitouob.com/home"
        } else {
            let json = JSON.parse(request.responseText);
            console.log(json);
            if(json.error == 1){
                username_site.style.border = "1px red solid";
            } else if(json.error == 2){
                email_site.style.border = "1px red solid";
                email_check = false;
                CheckSignUp();
            } else if(json.error ==3){
                email_site.style.border = "1px red solid";
                email_check = false;
                CheckSignUp();
            } else if(json.error == 4){
                password_site.style.border = "2px red solid";
                password_check = false;
                CheckSignUp();
            }
        }
    }
    request.open("PATCH", requestUrl, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}