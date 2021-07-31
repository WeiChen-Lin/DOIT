/* 控制新增worker的畫面出現 */ 
const addworkerbut = document.querySelector("#invite");
addworkerbut.addEventListener("click", ()=>{
    let addWorkerPage = document.querySelector("#leading > div.addWorkerPage");
    addWorkerPage.style.display = "block";
})

const work_background = document.querySelector("#leading > div.addWorkerPage > div.background_layer");
work_background.addEventListener("click", Work_closeJump);

function Work_closeJump(){
    let mail_site = document.querySelector("#leading > div.addWorkerPage > div.addWorker > div > input[type=text]");
    mail_site.value="";
    let addWorkerPage = document.querySelector("#leading > div.addWorkerPage");
    addWorkerPage.style.display = "none";
    document.querySelector("#tick_mail").style.opacity=0;
};

window.addEventListener('keydown', function (event) {
    if(event.keyCode == 27 && addWorkerPage.style.display == "block"){
        Work_closeJump();
    };
});

/* 
控制分配工作的畫面
*/

/* 取得中文的正確長度 */
function getlengthb(str){
    return str.replace(/[^\x00-\xff]/g,"**").length;
}

/* work detail 的textarea */ 
const workTextarea = document.querySelector("#detail");
workTextarea.addEventListener("keydown", (e) => {
    if(e.keyCode == 13 && e.shiftKey){
        e.preventDefault();
        workTextarea.value += "\n"; 
        workTextarea.rows += 1;  
    } else if (e.keyCode == 13){
        // 只能透過按鈕送出
        e.preventDefault();
    } else if (e.keyCode == 8){
        if(workTextarea.value){
            let lines = workTextarea.value.split("\n");
            if(!lines[lines.length - 1]) {
                workTextarea.rows -= 1;
            }
        }
    }
})

workTextarea.addEventListener("input", ()=>{
    if(workTextarea.value == ""){
        workTextarea.rows = "1";
    }
    let lines = workTextarea.value.split("\n");
    let count = 0;
    lines.forEach(ele => {
        let Truelength = getlengthb(ele);
        if(Truelength > 56){
            count = count + parseInt(Truelength / 56);
        }
    });
    workTextarea.rows = lines.length + count;
})

/* title的textarea */
const titlearea = document.querySelector("#outline");
titlearea.addEventListener("keydown", (e) => {
    if(e.keyCode == 13 && e.shiftKey){
        e.preventDefault();
        titlearea.value += "\n"; 
        titlearea.rows += 1;  
    } else if (e.keyCode == 13){
        // 只能透過按鈕送出
        e.preventDefault();
    } else if (e.keyCode == 8){
        if(titlearea.value){
            let lines = titlearea.value.split("\n");
            if(!lines[lines.length - 1]) {
                titlearea.rows -= 1;
            }
        }
    }
})

titlearea.addEventListener("input", ()=>{
    if(titlearea.value == ""){
        titlearea.rows = "1";
    }
    let lines = titlearea.value.split("\n");
    let count = 0;
    lines.forEach(ele => {
        let Truelength = getlengthb(ele);
        if(Truelength > 56){
            count = count + parseInt(Truelength / 56);
        }
    });
    titlearea.rows = lines.length + count;
})

/* */
let assignbackground = document.querySelector("#leading > div.assignWorkPage > div.background_layer");
assignbackground.addEventListener("click", Assign_closeJump)

function Assign_closeJump(){
    let assign_page = document.querySelector("#leading > div.assignWorkPage");
    assign_page.style.display = "none";
    workTextarea.value = "";
    titlearea.value = "";
};

let assign_but = document.querySelector("#assign");
assign_but.addEventListener("click", () => {
    let assign_page = document.querySelector("#leading > div.assignWorkPage");
    assign_page.style.display = "block";
})