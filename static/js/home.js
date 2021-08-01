let userID;
let userName;
/* 
操作 teampage 和 personal setting的切換 
*/
const menu = document.querySelectorAll("#menu");
const team = menu[0];
const personal = menu[1];

// 團隊頁面
function TeamPage(){
    let focus = document.querySelector("body > div.Workspace");
    let nonfocus = document.querySelector("body > div.setting");
    menu.forEach(item => item.classList.remove("select"));
    team.classList.add("select");
    focus.style.display = "block";
    nonfocus.style.display = "none";
};

// Setting頁面
function SettingPage(){
    let nonfocus = document.querySelector("body > div.Workspace");
    let focus = document.querySelector("body > div.setting");
    menu.forEach(item => item.classList.remove("select"));
    personal.classList.add("select");
    focus.style.display = "block";
    nonfocus.style.display = "none";
};

team.addEventListener("click", TeamPage, true);
personal.addEventListener("click", SettingPage, true);

TeamPage();

/* 初次瀏覽以ajax拿資料(個人資料、團隊資料) */
function getInfor(){
    let requestURL = domain_name + "/api/home";
    let request = new XMLHttpRequest();
    homeLoading();
    request.onload = function(){
        if (request.status == 200){
            let json = JSON.parse(this.responseText);
            let email_site = document.querySelector("#email");
            let username_site = document.querySelector("#username");
            let email = document.createTextNode(json.userinfo.email);
            let username = document.createTextNode(json.userinfo.name);
            email_site.appendChild(email);
            username_site.appendChild(username);
            userID = json.userinfo.id;
            userName = json.userinfo.name;
            let img_site = document.querySelector("body > div.setting > div.spaceinfo > div.personImg > div.uploadimg > img");
            img_site.src = json.userinfo.imgurl;
            let leading = json.teaminfo.leading;
            let working = json.teaminfo.working;
            let leading_site = document.querySelector("#leading");
            let working_site = document.querySelector("#working");
            leading.forEach(ele => drawTeam(ele.teamName, ele.count, leading_site, ele.teamID));
            working.forEach(ele => drawTeam(ele.teamName, ele.count, working_site, ele.teamID));
            homeFinishLoading();
        } else {
            alert("please login first");
            window.location.href = domain_name;
        }
    }
    request.open("GET" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
};

/* 控制新增team的畫面出現 */ 
const addTeambut = document.querySelector("#addteambut");

addTeambut.addEventListener("click", ()=>{
    let addTeam = document.querySelector("#addTeamPage");
    addTeam.style.display = "block";
})

const background = document.querySelector("#addTeamPage > div.background_layer");
background.addEventListener("click", closeJump);

function closeJump(){
    let addTeam = document.querySelector("#addTeamPage");
    addTeam.style.display = "none";
};

window.addEventListener('keydown', function (event) {
    if(event.keyCode == 27){
        closeJump();
    };
});

/* 新增team的按鈕 */
const createTeambut = document.querySelector("#addTeamPage > div.addTeam > div > button");
const teamInput_site = document.querySelector("#addTeamPage > div.addTeam > div > input[type=text]");
createTeambut.addEventListener("click", createTeam);
function createTeam(){
    let requestURL = domain_name + "/api/home";
    let data = {};
    data.userID = userID;
    data.teamName = teamInput_site.value;
    let data_to_python = JSON.stringify(data);
    let request = new XMLHttpRequest();
    let load_site = document.querySelector("#addTeamPage > div.addTeam > div > button");
    load_site.textContent = "";
    loaderIcon(load_site, 36);
    request.onload = function(){
        if (request.status == 200){
            let json = JSON.parse(request.responseText);
            let site = document.querySelector("#leading");
            drawTeam(json.teaminfo.teamName, 1, site, json.teaminfo.teamID);
            teamInput_site.value = "";
            load_site.textContent = "create";
            closeIcon(load_site);
            closeJump();
        } else {
            alert("please login first");
            window.location.href = domain_name + "";
        }
    }
    request.open("PATCH", requestURL, true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
}

/* js創造team的block */
function drawTeam(name, member, site, teamID){
    let team = document.createElement("div");
    team.className = "team";
    team.addEventListener("click", ()=>{
        window.open(domain_name + "/team/" + teamID)
    })

    let teamName = document.createElement("div");
    teamName.className = "teamName";

    let teamMember = document.createElement("div");
    teamMember.className = "teamMember";

    let membericon = document.createElement("div");
    membericon.className = "membericon";

    let membernumber = document.createElement("div");
    membernumber.className = "membernumber";

    let inputName = document.createTextNode(name);
    let inputNumber = document.createTextNode(member);
    teamName.appendChild(inputName);
    membernumber.appendChild(inputNumber);

    let img = document.createElement("img");
    img.src = "../static/css/fig/worker.png";
    membericon.appendChild(img);

    teamMember.appendChild(membericon);
    teamMember.appendChild(membernumber);
    team.appendChild(teamName);
    team.appendChild(teamMember);

    site.appendChild(team);
}
