let detailID;
let message_area = document.querySelector("#message_area");
message_area.addEventListener("keydown", (e) => {
    if(e.keyCode == 13 && e.shiftKey){
        e.preventDefault();
        message_area.value += "\n"; 
        message_area.rows += 1;  
    } else if (e.keyCode == 13){
        /* 這邊要送出 */
        e.preventDefault();
        if(message_area.value){
            message_area.value = message_area.value.replace(new RegExp('\n','g'), '<br>');
            uploadMessage(workID, message_area.value)
            message_area.value = "";
            message_area.rows = "1";
        }
    } else if (e.keyCode == 8){
        if(message_area.value){
            let lines = message_area.value.split("\n");
            if(!lines[lines.length - 1]) {
                message_area.rows -= 1;
            }
        }
    }
})

message_area.addEventListener("input", ()=>{
    if(message_area.value == ""){
        message_area.rows = "1";
    }
    let lines = message_area.value.split("\n");
    message_area.rows = lines.length;
})

function drawWorkBlock(workTitle, img, workerName, datetime, type, workStatus, workID){
    let title = document.createElement("div");
    title.className = "deriviation";
    title.innerHTML = workTitle.replace(/\n/g, "<br/>");

    let workerinfo = document.createElement("div");
    workerinfo.className = "worker";

    let workerImg = document.createElement("div");
    workerImg.className = "workerImg";

    let img_site = document.createElement("img");
    img_site.src = img;

    workerImg.appendChild(img_site);

    let workerName_site = document.createElement("div");
    workerName_site.className = "workerName";
    let name_text = document.createTextNode(workerName);
    workerName_site.appendChild(name_text);
    workerinfo.appendChild(workerImg);
    workerinfo.appendChild(workerName_site);

    let date = document.createElement("div");
    date.className = "date";
    let date_toInt = parseInt(datetime)
    let date_to = new Date(date_toInt);
    let date_text = document.createTextNode(date_to.getFullYear() + "-" + (date_to.getMonth() + 1) + "-" + date_to.getDate());
    date.appendChild(date_text);

    let work_container = document.createElement("div");
    work_container.className = "work";
    work_container.id = "container_" + workID; 
    work_container.appendChild(title);
    work_container.appendChild(workerinfo);
    work_container.appendChild(date);

    work_container.addEventListener("click", ()=>{
        drawDetailPage(workerName, workStatus, workID, type);
        let detail = document.querySelector("body > div.workdetail");
        detail.style.display = "block";
    })

    if(workStatus == "0"){
        work_container.style.backgroundColor = "rgb(166, 245, 166)";
    } else if(workStatus == "1"){
        work_container.style.backgroundColor = "rgb(247, 191, 191)";
    } else if(workStatus == "2"){
        work_container.style.backgroundColor = "rgb(184, 162, 121)";
    } 
    
    if(type==0){
        let work_append_site = document.querySelector("#leading > div.workcontainer");
        let insert_check = document.querySelector("#leading > div.workcontainer > div.work");
        if(insert_check){
            work_append_site.insertBefore(work_container, insert_check);
        } else {
            work_append_site.appendChild(work_container);
        }
    } else if(type ==1){
        let work_append_site = document.querySelector("#working > div.workcontainer");
        let insert_check = document.querySelector("#working > div.workcontainer > div.work");
        if(insert_check){
            work_append_site.insertBefore(work_container, insert_check);
        } else {
            work_append_site.appendChild(work_container);
        }
    }

}

function drawDetailPage(workerName, workStatus, id, type){
    workID = id;
    message_area.style.display = "none";
    clearDetail();
    let loaddetail = document.querySelector("body > div.workdetail");
    loaderIcon(loaddetail, 120);
    let data = {}
    data.workID = workID;
    let data_to_python = JSON.stringify(data);
    let requestURL = "http://52.76.36.230:3000/api/detail/" + workID;
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            if(type == 0){
                closeIcon(loaddetail);
                createLeadBut(workStatus, workID);
                message_area.style.display = "none";
                let json = JSON.parse(request.responseText);
                let leavebut = document.querySelector("#but_leave");
                leavebut.addEventListener("click", closeJump);
                let worker_site = document.querySelector(".detail_worker_name");
                let worker_text = document.createTextNode(workerName);
                worker_site.appendChild(worker_text);
                let title_site = document.querySelector(".detail_work");
                title_site.innerHTML = json.detail.replace(/\\n/g, "<br/>");
                json.communication.forEach(ele => drawComment(ele.detailID, ele.date, ele.message, ele.comment));
            } else if (type == 1){
                closeIcon(loaddetail);
                createWorkBut(workStatus, workID)
                message_area.style.display = "block";
                let json = JSON.parse(request.responseText);
                let leavebut = document.querySelector("#but_leave");
                leavebut.addEventListener("click", closeJump);
                let worker_site = document.querySelector(".detail_worker_name");
                let worker_text = document.createTextNode(workerName);
                worker_site.appendChild(worker_text);
                let title_site = document.querySelector(".detail_work");
                title_site.innerHTML = json.detail.replace(/\\n/g, "<br/>");
                json.communication.forEach(ele => drawWokerMessage(ele.date, ele.message, ele.comment));
            }
        }
    }
    request.open("GET", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

function clearDetail(){
    let list = document.querySelector(".update_list");
    let update = document.querySelectorAll(".update");
    if(update){
        update.forEach(ele => {
            list.removeChild(ele);
        });
    }
    let worker = document.querySelector(".detail_worker_name");
    let detail_work = document.querySelector(".detail_work")
    worker.innerHTML = "";
    detail_work.innerHTML = "";
    let img = document.querySelector("body > div.workdetail > div.detail > div.forManager > div.submitfile > img");
    let img_site = document.querySelector(".submitfile");
    if(img){
        img_site.removeChild(img);
    }
    let but = document.querySelectorAll(".detail_but");
    let but_site = document.querySelector(".manageraction");
    if(but){
        but.forEach(ele=>{but_site.removeChild(ele)});
    }
}

function createLeadBut(worktype, work_ID){
    if(worktype == "0"){
        createBut(3, work_ID);
        createBut(5, work_ID);
    } else if (worktype == "1"){
        createBut(5, work_ID);
    } else if (worktype == "2"){
        createBut(0, work_ID);
        createBut(1, work_ID);
        createBut(5, work_ID)
    }
}

function createWorkBut(worktype, work_ID){
    if(worktype == "0"){
        createBut(5, work_ID);
    } else if (worktype == "1"){
        createBut(2, work_ID);
        createBut(5, work_ID);
    } else if (worktype == "2"){
        createBut(5, work_ID);
    }
}

function createBut(id, work_ID){
    let but = document.createElement("button");
    but.className = "detail_but";
    if(id == 0){
        but.id = "but_welldone";
        let text = document.createTextNode("Done!");
        but.appendChild(text);
        but.addEventListener("click", ()=>{
            but.textContent = "";
            loaderIcon(document.querySelector("#but_welldone"), 24);
            ChangeStatus(work_ID, 2, "rgb(166, 245, 166)", but);
        })
    } else if (id == 1){
        but.id = "but_keepworking";
        let text = document.createTextNode("Keep Working");
        but.appendChild(text);
        but.addEventListener("click", ()=>{
            but.textContent = "";
            loaderIcon(document.querySelector("#but_keepworking"), 24);
            ChangeStatus(work_ID, 3, "rgb(247, 191, 191)", but);
        })
    } else if (id == 2){
        but.id = "but_check";
        let text = document.createTextNode("Submit");
        but.appendChild(text);
        but.addEventListener("click", ()=>{
            but.textContent = "";
            loaderIcon(document.querySelector("#but_check"), 24);
            ChangeStatus(work_ID, 1, "rgb(184, 162, 121)", but);
        })
    } else if (id == 3){
        but.id = "but_delete";
        let text = document.createTextNode("Delete");
        but.appendChild(text);
        but.addEventListener("click", ()=>{
            but.textContent = "";
            loaderIcon(document.querySelector("#but_delete"), 24);
            ChangeStatus(work_ID, 4, "rgb(117, 116, 116)", but);
        })
    } else {
        but.id = "but_leave";
        let text = document.createTextNode("Leave");
        but.appendChild(text);
    };
    let but_site = document.querySelector(".manageraction");
    but_site.appendChild(but);
}

function drawComment(detailID, date, detail, comment){
    let update = document.createElement("div");
    update.className = "update";

    let update_date = document.createElement("div");
    update_date.className = "update_date";
    let date_toint = parseInt(date);
    let date_toc = new Date(date_toint);
    let date_text = document.createTextNode(date_toc.getFullYear() + "-" + (date_toc.getMonth() + 1) + "-" + date_toc.getDate());
    update_date.appendChild(date_text); 

    let update_thing = document.createElement("div");
    update_thing.className = "update_thing";
    update_thing.innerHTML = detail.replace(/\\n/g, "<br/>");

    let comment_but = document.createElement("button");
    comment_but.type = "button";
    let but_text = document.createTextNode("comment");
    comment_but.appendChild(but_text);

    let hr = document.createElement("hr");

    let comment_area = document.createElement("textarea");
    comment_area.rows = "1";
    comment_area.cols = "70";
    comment_area.placeholder = "Press enter to submit, shift + enter to add rows";
    comment_area.wrap = "Virtual";
    comment_area.style.display = "none";
    comment_area.addEventListener("keydown", (e) => {
        if(e.keyCode == 13 && e.shiftKey){
            e.preventDefault();
            comment_area.value += "\n"; 
            comment_area.rows += 1;  
        } else if (e.keyCode == 13){
            /* 這邊要送出 */
            e.preventDefault();
            if(comment_area.value){
                updateComment(detailID, comment_area.value, comment_site);
                comment_area.value = comment_area.value.replace(new RegExp('\n','g'), '<br>');
                comment_site.innerHTML = comment_area.value;
                comment_area.value = "";
                comment_area.rows = "1";
            }
        } else if (e.keyCode == 8){
            if(comment_area.value){
                let lines = comment_area.value.split("\n");
                if(!lines[lines.length - 1]) {
                    comment_area.rows -= 1;
                }
            }
        }
    })

    comment_area.addEventListener("input", ()=>{
        if(comment_area.value == ""){
            comment_area.rows = "1";
        }
        let lines = comment_area.value.split("\n");
        comment_area.rows = lines.length;
    })

    comment_but.addEventListener("click", ()=>{comment_area.style.display = "block"});

    update.appendChild(update_date);
    update.appendChild(update_thing);
    update.appendChild(comment_but);
    update.appendChild(hr);

    let comment_site = document.createElement("div");
    comment_site.className = "comment";
    if(comment){
        comment = comment.replace(/\\n/g, "<br/>");
        comment_site.innerHTML = comment;
    }
    update.appendChild(comment_site);
    update.appendChild(comment_area);

    let list = document.querySelector(".update_list");
    list.appendChild(update);
}

function drawWokerMessage(date, detail, comment){
    let update = document.createElement("div");
    update.className = "update";

    let update_date = document.createElement("div");
    update_date.className = "update_date";
    let date_toint = parseInt(date);
    let date_toc = new Date(date_toint);
    let date_text = document.createTextNode(date_toc.getFullYear() + "-" + (date_toc.getMonth() + 1) + "-" + date_toc.getDate());
    update_date.appendChild(date_text); 

    let update_thing = document.createElement("div");
    update_thing.className = "update_thing";
    update_thing.innerHTML = detail.replace(/\\n/g, "<br/>");

    let hr = document.createElement("hr");

    update.appendChild(update_date);
    update.appendChild(update_thing);
    update.appendChild(hr);

    let comment_site = document.createElement("div");
    comment_site.className = "comment";
    if(comment){
        comment = comment.replace(/\\n/g, "<br/>");
        comment_site.innerHTML = comment;
        update.appendChild(comment_site);
    }

    let list = document.querySelector(".update_list");
    let insert_site_thing = document.querySelector(".update");
    if(insert_site_thing){
        list.insertBefore(update, insert_site_thing);
    } else {
        list.appendChild(update);
    }
}

function updateComment(detailID, value, message_site){
    let data = {};
    data.comment = value;
    data.type = 0;
    let data_to_python = JSON.stringify(data);
    let requestURL = "http://52.76.36.230:3000/api/detail/" + detailID;
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            console.log("OK")
        } else {
            message_site.style.color ="red";
        }
    }
    request.open("POST", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

function uploadMessage(workID, value, site){
    let data = {};
    data.comment = value;
    data.type = 1;
    data.workID = workID;
    data.date = Date.now();
    drawWokerMessage(data.date, value)
    let data_to_python = JSON.stringify(data);
    let requestURL = "http://52.76.36.230:3000/api/detail/" + detailID;
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
        } else {
            let error_site = document.getElementsByClassName("update_thing")[0];
            error_site.style.color = "red";
        }
    }
    request.open("POST", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

//更改工作狀態
function ChangeStatus(workID, status, color){
    let data = {};
    data.workID = workID;
    data.status = status; 
    data.type = 0;
    data.date = Date.now();
    let data_to_python = JSON.stringify(data);
    let requestURL = "http://52.76.36.230:3000/api/notification";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            closeJump();
            let target = document.querySelector("#container_" + workID);
            target.style.backgroundColor = color;
            socket.emit("")
        }
    }
    request.open("PATCH", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}
