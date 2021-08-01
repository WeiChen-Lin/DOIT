/* 目前focus的teamID寫在html的模板內*/
let workerID;
// 預設 status = 4 為篩選出全部工作
let status = 4;

const homePage = document.getElementsByClassName("DoitIcon");
homePage[0].addEventListener("click", ()=>{window.location.href = domain_name + "/home"});
/*
控制詳細畫面的出現與否
 -> 此為控制 detail 畫面出現與否
 1. userID (目前登入的對象，寄email用)
 1. userName (目前登入的對象，寄email用)
 3. CurrentTeamName (目前登入的對象，寄email用)
 4. filterUser (篩選工作)
 5. assignUser (安排工作)
*/

let userID, userName, CurrentTeamName, filterUser, assignUser, workID;

let background = document.querySelector("body > div.workdetail > div.background_layer");

background.addEventListener("click", closeJump);

function closeJump(){
    let detail = document.querySelector("body > div.workdetail");
    detail.style.display = "none";
};

window.addEventListener('keydown', function (event) {
    if(event.keyCode == 27){
        closeJump();
    };
});

/* 初次進入抓取 teamName 和把teamID綁到變數上 */
function TeamGetInfor(){
    let requestURL = domain_name + "/api/team";
    let data = {}
    data.teamID = teamID;
    let data_to_python = JSON.stringify(data);
    let request = new XMLHttpRequest();
    loaderIcon(leading_page, 120);
    request.onload = function(){
        if (request.status == 200){
            closeIcon(leading_page);
            let json = JSON.parse(request.responseText);
            userID = json.userinfo.id;
            userName = json.userinfo.name;
            let leading_site = document.querySelector("body > div.title > div.leading");
            let working_site = document.querySelector("body > div.title > div.working");
            json.teaminfo.leading.forEach(ele => drawTeamBlock(ele.teamName, leading_site, 0, ele.teamID, ele.teamName, json.workinfo.workoutline, json.workinfo.worker));
            json.teaminfo.working.forEach(ele => drawTeamBlock(ele.teamName, working_site, 1, ele.teamID, ele.teamName, json.workinfo.workoutline, json.workinfo.worker));
            getNotification();
        } else {
            alert("please login first");
            window.location.href = domain_name + "";
        }
    }
    request.open("POST", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

/* 畫出團隊，這個函數是左邊團隊項目內容，會呼叫drawPage畫出團隊細節 */ 
function drawTeamBlock(teamName, site, type, id, name, workoutline, worker){
    let team_div = document.createElement("div");
    team_div.className = "team";
    if(id == teamID){
        team_div.classList.add("select");
        if(type == 0){
            selectLead();
            drawPage(name, workoutline, type);
            drawWorker(0, "All Worker");
            worker.forEach(ele => drawWorker(ele.userID, ele.userName));
        } else if(type == 1){
            selectWork();
            drawPage(name, workoutline, type);
        }
    };
    let team = document.createTextNode(teamName);
    team_div.appendChild(team);
    if(type == 0){
        team_div.addEventListener("click", function(){
            let that = this;
            clickGetLeadTeam(that, id);
        });
    } else if(type == 1){
        team_div.addEventListener("click", function(){
            let that = this;
            console.log(this);
            console.log(teamID);
            clickGetWorkingTeam(that, id, userID);
        })
    }
    site.appendChild(team_div);
}

let leading_page = document.querySelector("#leading");
let working_page = document.querySelector("#working");

/* 畫出團隊細節用函數 */
function drawPage(name, workoutline, type){
    clearLeadPage();
    clearWorkPage();
    
    let teamname = document.createTextNode(name);
    CurrentTeamName = name;
    if(type==0){
        removeSelect();
        Allstatus.classList.add("filterbut");
        let name_site = document.querySelector("#leading > div.spaceTitle > div.space_text");
        name_site.appendChild(teamname);
    } else if(type == 1){
        removeSelect();
        Work_all.classList.add("filterbut");
        let name_site = document.querySelector("#working > div.spaceTitle > div.space_text");
        name_site.appendChild(teamname);
    }

    if(workoutline){
        workoutline.forEach(ele => drawWorkBlock(ele.workTitle, ele.imgurl, ele.workername, ele.date, type, ele.workStatus, ele.workID));
    }
}

/* 清除leading page */
function clearLeadPage(){
    let leadingWork = document.querySelector("#leading > div.workcontainer");
    let work = document.querySelectorAll("#leading > div.workcontainer > div.work");
    if(work){
        work.forEach(ele => leadingWork.removeChild(ele));
    }
    let selection = document.querySelector("#leading > div.filter > div.selectworker > select");
    let select = document.querySelectorAll("#select_worker");
    select.forEach(ele => selection.removeChild(ele));
    let teamName = document.querySelector("#leading > div.spaceTitle > div.space_text");
    teamName.textContent ="";

    let assign_site = document.querySelector("#assignSelect");
    let assign = document.querySelectorAll("#worker");
    assign.forEach(ele => assign_site.removeChild(ele));
}

/* 清除working page */
function clearWorkPage(){
    let teamname_site = document.querySelector("#working > div.spaceTitle > div.space_text");
    teamname_site.textContent = "";

    let work = document.querySelectorAll("#working > div.workcontainer > div.work");
    let work_site  = document.querySelector("#working > div.workcontainer");
    work.forEach(ele => work_site.removeChild(ele));
}

/* 弄出leading page的worker */
function drawWorker(userID, userName){
    let selection_site = document.querySelector("#leading > div.filter > div.selectworker > select");
    let option = document.createElement("option");
    option.id = "select_worker";
    option.value = userID;
    let option_name = document.createTextNode(userName);
    option.appendChild(option_name);
    selection_site.appendChild(option);

    let assign_site = document.querySelector("#assignSelect");
    let assign_option = document.createElement("option");
    assign_option.id = "worker";
    assign_option.value = userID;
    let assign_name = document.createTextNode(userName);
    assign_option.appendChild(assign_name);
    assign_site.appendChild(assign_option);
}

/* 選擇呈現leading page */
function selectLead(){
    if(leading_page.style.display =""){
        leading_page.style.display = "block";
        working_page.style.display = "none";
    } else if (leading_page.style.display = "none"){
        leading_page.style.display = "block";
        working_page.style.display = "none";
    }
}

/* 選擇呈現working page */
function selectWork(){
    if(working_page.style.display =""){
        leading_page.style.display = "none";
        working_page.style.display = "block";
    } else if (working_page.style.display = "none"){
        leading_page.style.display = "none";
        working_page.style.display = "block";
    }
}

/* 按下會畫出點選的leading團隊 */
function clickGetLeadTeam(that, id){

    selectLead();
    removeSelect();
    Allstatus.classList.add("filterbut");
    let allwork = document.getElementsByClassName("team");

    for(let i = 0; i < allwork.length; i++){
        allwork[i].classList.remove("select");
    }

    that.classList.add("select");
    clearLeadPage();
    loaderIcon(leading_page, 120);
    let requestURL = domain_name + "/api/team";
    let data = {}
    data.type = 0;
    data.teamID = id;
    teamID = id;
    let data_to_python = JSON.stringify(data);
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status == 200){
            let json = JSON.parse(request.responseText);
            drawPage(that.textContent, json.workinfo.workoutline, json.workinfo.type);
            drawWorker(0, "All Worker");
            json.workinfo.worker.forEach(ele => drawWorker(ele.userID, ele.userName));
            closeIcon(leading_page);
        } else {
            alert("please login first");
            window.location.href = domain_name + "";
        }
    }
    request.open("PATCH", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

/* 按下會畫出點選的working團隊 */
function clickGetWorkingTeam(that, id, userID){
    
    selectWork();
    teamID = id;
    let allwork = document.getElementsByClassName("team");
    for(let i = 0; i < allwork.length; i++){
        allwork[i].classList.remove("select");
    }

    that.classList.add("select");
    clearWorkPage();
    loaderIcon(working_page, 120);
    let requestURL = domain_name + "/api/team";
    let data = {}
    data.type = 1;
    data.userID = userID;
    data.teamID = teamID;
    let data_to_python = JSON.stringify(data);
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status == 200){
            let json = JSON.parse(request.responseText);
            drawPage(that.textContent, json.workinfo.workoutline, json.workinfo.type);
            closeIcon(working_page);
        } else {
            alert("please login first");
            window.location.href = domain_name + "";
        }
    }
    request.open("PATCH", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

/* 將invite 的按鈕綁上寄信函數 */
let invite_but = document.querySelector("#leading > div.addWorkerPage > div.addWorker > div > button");
invite_but.addEventListener("click", InviteMember);

function InviteMember(){
    let data = {}
    data.teamID = teamID;
    data.InviteTeamName = CurrentTeamName;
    data.userID = userID;
    data.userName = userName;
    data.userEmail = document.querySelector("#leading > div.addWorkerPage > div.addWorker > div > input[type=text]").value;
    let load_site = document.querySelector("#leading > div.addWorkerPage > div.addWorker > div > button");
    load_site.textContent="";
    loaderIcon(load_site, 24);
    let data_to_python = JSON.stringify(data);
    let requestURL = domain_name + "/api/mail";
    let request = new XMLHttpRequest();
    request.onload = function(){
        let OKimg = document.querySelector("#tick_mail");
        OKimg.style.opacity=1;
        load_site.textContent = "Invite";
        closeIcon(load_site);   
    }
    request.open("POST", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

/* 篩選工作者用 */
let menu = document.querySelector("#leading > div.filter > div.selectworker > select")
function getSelectUser(inputstatus){
    status = inputstatus;
    let leadingWork = document.querySelector("#leading > div.workcontainer");
    let work = document.querySelectorAll("#leading > div.workcontainer > div.work");
    if(work){
        work.forEach(ele => leadingWork.removeChild(ele));
    }
    let index = menu.selectedIndex;
    filterUser = menu.options[index].value;
    let data = {};
    data.teamID = teamID;
    data.userID = filterUser;
    data.workStatus = status;
    data.type = 0;
    let data_to_python = JSON.stringify(data);
    let requestURL = domain_name + "/api/work"
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            let json = JSON.parse(request.responseText);
            let type = json.data.type;
            let outline = json.data.workoutline;
            outline.forEach(ele => drawWorkBlock(ele.workTitle, ele.imgurl, ele.workername, ele.date, type, ele.workStatus, ele.workID))
        }
    }
    request.open("PATCH", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
};
menu.addEventListener("change", ()=>{
    getSelectUser(status);
})

let assign_menu = document.querySelector("#assignSelect");
function getAssignUser(){
    let index = assign_menu.selectedIndex;
    assignUser = assign_menu.options[index].value;
};
assign_menu.addEventListener("change", getAssignUser)

/* 安排工作用*/
function SendWorktoAPI(){
    let data = {}
    data.teamID = teamID;
    data.userID = assignUser;
    data.date = Date.now();
    data.workTitle = document.querySelector("#outline").value;
    data.detail = document.querySelector("#detail").value;
    data.workStatus = 1;
    let data_to_python = JSON.stringify(data);
    let load_site = document.querySelector("#leading > div.assignWorkPage > div.assignWork > button");
    load_site.textContent = "";
    loaderIcon(load_site, 36);
    let requestURL = domain_name + "/api/work"
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status == 200){
            load_site.textContent = "Assign";
            let json = JSON.parse(request.responseText);
            let assign_page = document.querySelector("#leading > div.assignWorkPage");
            assign_page.style.display="none";
            drawWorkBlock(data.workTitle, json.data.imgurl, json.data.username, data.date, 0, 1, json.data.workID)
        } else {
            console.log("failed");
        }
    }
    request.open("POST", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}
let assign_work_but = document.querySelector("#leading > div.assignWorkPage > div.assignWork > button");
assign_work_but.addEventListener("click", SendWorktoAPI)

/* leading page 篩選工作狀態用*/
function removeSelect(){
    let buts = document.querySelectorAll(".progress > #filterbut");
    buts.forEach(ele => ele.classList.remove("filterbut"));
}
let Allstatus = document.querySelector("#leading > div.filter > div.progress > div.all");
Allstatus.addEventListener("click", ()=>{
    removeSelect();
    Allstatus.classList.add("filterbut");
    getSelectUser(4);
})
let FinishStatus = document.querySelector("#leading > div.filter > div.progress > div.finish");
FinishStatus.addEventListener("click", ()=>{
    removeSelect();
    FinishStatus.classList.add("filterbut");
    getSelectUser(0);
})
let WorkingStatus = document.querySelector("#leading > div.filter > div.progress > div.working");
WorkingStatus.addEventListener("click", ()=>{
    removeSelect();
    WorkingStatus.classList.add("filterbut");
    getSelectUser(1);
})
let PendingStatus = document.querySelector("#leading > div.filter > div.progress > div.pending");
PendingStatus.addEventListener("click", ()=>{
    removeSelect();
    PendingStatus.classList.add("filterbut");
    getSelectUser(2);
})

/* Working Page篩選狀態用 */
function filterwork(status){
    let leadingWork = document.querySelector("#working > div.workcontainer")
    let work = document.querySelectorAll("#working > div.workcontainer > div.work");
    if(work){
        work.forEach(ele => leadingWork.removeChild(ele));
    }
    let data = {};
    data.teamID = teamID;
    data.userID = userID;
    data.workStatus = status;
    data.type = 1;
    let data_to_python = JSON.stringify(data);
    let requestURL = domain_name + "/api/work"
    let request = new XMLHttpRequest();
    request.onload = function(){
        if(request.status == 200){
            let json = JSON.parse(request.responseText);
            let type = json.data.type;
            let outline = json.data.workoutline;
            outline.forEach(ele => drawWorkBlock(ele.workTitle, ele.imgurl, ele.workername, ele.date, type, ele.workStatus, ele.workID))
        }
    }
    request.open("PATCH", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
};
let Work_all = document.querySelector("#working > div.filter > div > div.all");
Work_all.addEventListener("click", ()=>{
    removeSelect();
    Work_all.classList.add("filterbut");
    filterwork(4);
})
let Work_working = document.querySelector("#working > div.filter > div > div.working");
Work_working.addEventListener("click", ()=>{
    removeSelect();
    Work_working.classList.add("filterbut");
    filterwork(1);
})
let Work_finish = document.querySelector("#working > div.filter > div > div.finish"); 
Work_finish.addEventListener("click", ()=>{
    removeSelect();
    Work_finish.classList.add("filterbut");
    filterwork(0);
})
let Work_pending = document.querySelector("#working > div.filter > div > div.pending");
Work_pending.addEventListener("click", ()=>{
    removeSelect();
    Work_pending.classList.add("filterbut");
    filterwork(2);
})
