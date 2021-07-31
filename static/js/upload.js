function view(){
    let file = personimgBut.files;
    let img_site = document.querySelector("body > div.setting > div.spaceinfo > div.personImg > div.uploadimg > img");
    let read = new FileReader();
    read.readAsDataURL(file[0]);
    read.onload = function(e){
        img_site.src = this.result;
    }
    let data = new FormData();
    data.append(personimgBut.name, file[0]);
    let requestURL = "http://52.76.36.230:3000/api/upload"
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            let img_box = document.querySelector("body > div.setting > div.spaceinfo > div.personImg > div.uploadimg");
            img_box.style.border = "5px solid green";
        } else {
            let img_box = document.querySelector("body > div.setting > div.spaceinfo > div.personImg > div.uploadimg");
            img_box.style.border = "5px solid red";
        }
    }
    request.open("POST", requestURL, true);
    request.send(data);
};

/* 首頁上傳大頭照 */
let personimgBut = document.querySelector("#upload_img");
personimgBut.addEventListener("change", view);