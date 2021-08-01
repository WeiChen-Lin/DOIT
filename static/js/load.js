/* 首頁登入框loaing */
function loaderIcon(target, size){
    createLoad(target);
    let child = target.children;
    if(child){
        for(let i = 0; i < child.length; i++){
            child[i].classList.add("onloading");
        };
    }
    let loader = target.getElementsByClassName("loading")[0];
    let size_set = loader.getElementsByClassName("loader")[0];
    size_set.style.width = size.toString() + "px";
    size_set.style.height = size.toString() + "px";
    loader.style.display = "block";
}

function closeIcon(target){ 
    let child = target.children;
    for(let i = 0; i < child.length; i++){
        child[i].classList.remove("onloading");
    };
    let loader = target.getElementsByClassName("loading")[0];
    if(loader){
        target.removeChild(loader);
    }
}

function homeLoading(){
    let leading_site=  document.querySelector("#leading");
    let working_site = document.querySelector("#working");

    loaderIcon(leading_site, 96);
    loaderIcon(working_site, 96);
}

function homeFinishLoading(){
    let leading_site=  document.querySelector("#leading");
    let working_site = document.querySelector("#working");

    closeIcon(leading_site);
    closeIcon(working_site);
}

function createLoad(site){

    let loading = document.createElement("div");
    loading.className = "loading";
    
    let loader = document.createElement("div");
    loader.className = "loader";

    let img = document.createElement("img");
    img.src = "../static/css/fig/ball_loading.gif";

    loader.appendChild(img);
    loading.appendChild(loader);

    site.appendChild(loading);
}
