const not_site = document.querySelector("body > div.notification > div.not_site");

function getNotification(){
    let requestURL = domain_name + "/api/notification";
    let request = new XMLHttpRequest();
    loaderIcon(not_site, 120);
    request.onload = function(){
        if(request.status == 200){
            closeIcon(not_site);
            let json = JSON.parse(request.responseText);
            json.data.forEach( e => { createLeadingNot(e.type, e.date, e.teamName, e.workTitle, e.workerName, userID)});
        }
    }
    request.open("GET", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

function createSpan(text){
    let span = document.createElement("span");
    span.style.fontWeight = "bold";
    let text_site = document.createTextNode(text);
    span.appendChild(text_site);

    return span;
}

function createLeadingNot(type, date, teamName, title, workername, userID){
    let div = document.createElement("div");
    let site = document.querySelector("body > div.notification > div.not_site");
    div.className = "not";
    div.id = userID + "_not_" + date;
    div.style.opacity = 1;
    div.appendChild(createSpan(workername));
    div.appendChild(document.createTextNode("已在您的團隊『"));
    div.appendChild(createSpan(teamName));
    div.appendChild(document.createTextNode("』中的『"));
    div.appendChild(createSpan(title));
    if(type == 0){
        div.appendChild(document.createTextNode("』新增了一項留言"));
    } else if( type == 1){
        div.appendChild(document.createTextNode("』更改了工作狀態"));
    }
    
    let time_site = document.createElement("div");
    time_site.className = "not_time";
    
    let now_time = Date.now() - date;
    now_time = parseInt( now_time / 1000 )
    if(now_time < 60){
        let time_text = document.createTextNode("just now")
        time_site.appendChild(time_text);
    } else if ( now_time < 3600 &  now_time > 60){
        let mins = parseInt(now_time / 60);
        let time_text = document.createTextNode(mins.toString() + " min(s) ago")
        time_site.appendChild(time_text);
    } else if ( now_time < 86400 & now_time > 3600){
        let hrs = parseInt(now_time / 3600);
        let time_text = document.createTextNode(hrs.toString() + " hour(s) ago")
        time_site.appendChild(time_text);
    } else {
        let days = parseInt(now_time / 86400);
        let time_text = document.createTextNode(days.toString() + " day(s) ago")
        time_site.appendChild(time_text);
    }
    div.appendChild(time_site);

    let delete_img = document.createElement("img");
    delete_img.className = "deleteNot";
    delete_img.src = "../static/css/fig/deleteNot.png";
    
    delete_img.addEventListener("click", ()=>{
        DeleteLeadingNot(userID, date);
    })

    div.appendChild(delete_img);

    div.addEventListener("mouseenter", ()=>{delete_img.style.opacity = "1";})
    div.addEventListener("mouseleave", ()=>{delete_img.style.opacity = "0";})


    let check = document.getElementsByClassName("not");
    if(check){
        site.insertBefore(div, check[0]);
    } else {
        site.appendChild(div);
    }
}

function DeleteLeadingNot(userID, date){
    let data = {};
    data.key = userID +"_not_" + date;
    let requestURL = domain_name + "/api/notification";
    let request = new XMLHttpRequest();
    let remove_not = document.getElementById(data.key);
    let data_to_python = JSON.stringify(data);
    loaderIcon(remove_not, 24);
    request.onload = function(){
        if(request.status == 200){
            closeIcon(remove_not);
            not_site.removeChild(remove_not);
        }
    }
    request.open("DELETE", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}
