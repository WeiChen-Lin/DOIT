from flask import *
from flask_mail import Mail, Message
import sys, json, jwt, datetime
sys.path.append("./SQL")
#自行寫的資料庫操作
from SQLoperation import UserSQL, TeamSQL, WorkSQL, MailSQL, S3_SQL
#redis操作
from RedisOperation import ReOper
#連接aws, S3服務
from s3DataStorage import uploadFile
#引入環境參數配置
from dotenv import dotenv_values
#Socket
#from flask_socketio import SocketIO, emit, join_room


config = dotenv_values(".env")

sqlConfig = {
    "port" : int(config["port"]),
    "user" : config["user"],
    "password" : config["password"],
    "db" : config["db"],
    "charset" : config["charset"],
    "host" : config["host"]
}

s3Config = {
    "aws_access_key_id":config["aws_access_key_id"],
    "aws_secret_access_key":config["aws_secret_access_key"]
}

#創建SQL物件
usersqlobject = UserSQL(sqlConfig)
teamsqlobject = TeamSQL(sqlConfig)
worksqlobject = WorkSQL(sqlConfig)
mailsqlboject = MailSQL(sqlConfig)
s3sqlobject = S3_SQL(sqlConfig)

s3Object = uploadFile(s3Config)

app=Flask(__name__)
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PROT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=config["mail_sender"],
    MAIL_PASSWORD=config["mail_password"]
)
mail = Mail(app)

redisObject = ReOper()

# socketio = SocketIO(app) 

#Pages
@app.route("/")
def index():

    return render_template("index.html")

@app.route("/home")
def homePage():

    return render_template("home.html")

@app.route("/team/<id>")
def TeamPage(id):

    return render_template("team.html", teamID = id)

@app.route("/api/sign", methods=["POST", "GET", "PATCH", "DELETE"])
def sign():
    
    #註冊方面
    if request.method == 'POST':

        data = request.get_json()
        
        #FB註冊
        if data["loginRoute"] == 0:

            usersqlobject.tableInsertFBUser(data["userName"], data["userEmail"], data["loginRoute"], data["userID"])

            userinfo = usersqlobject.getUser(data["userEmail"])
            
            expire = datetime.datetime.utcnow() + datetime.timedelta(days=3)

            response = make_response( jsonify({"ok":True}) , 200)

            token  = jwt.encode( {"userID": userinfo["id"], "email": userinfo["email"], "exp": expire} , config["jwt_secret_key"])
                    
            response.set_cookie(key="token" , value=token , expires=expire)

            response.headers["Content-Type"] = "application/json"
                    
            return response
        
        #Do it! 平台註冊
        elif data["loginRoute"] == 1:

            status = usersqlobject.tableInsertDoitUser(data["userName"], data["userEmail"], data["userPwd"], data["loginRoute"])

            if status["status"] == 5:

                userinfo = usersqlobject.getUser(data["userEmail"])
            
                expire = datetime.datetime.utcnow() + datetime.timedelta(days=3)

                response = make_response( jsonify({"ok":True}) , 200)

                token  = jwt.encode( {"userID": userinfo["id"], "email": userinfo["email"], "exp": expire} , config["jwt_secret_key"])
                        
                response.set_cookie(key="token" , value=token , expires=expire)

                response.headers["Content-Type"] = "application/json"
                        
                return response
            
            else:

                response = make_response( jsonify({"error":status["status"]}) , 400)
                        
                return response

    #首次瀏覽時以cookie抓取token確認有無登入
    elif request.method == 'GET':

        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
        

        data = jwt.decode(cookie, config["jwt_secret_key"] , algorithms=['HS256'])

        response = make_response( jsonify({"status":"Login", "userinfo":usersqlobject.getUser(data["email"])}), 200)
        
        response.headers["Content-Type"] = "application/json"
        
        return response

    #登入動作 (並加上token)
    elif request.method == "PATCH":

        data = request.get_json()

        #透過FB登入
        if data["loginRoute"] == 0:

            if usersqlobject.CheckUserfromFB(data["userEmail"], data["userID"]):
                
                userinfo = usersqlobject.getUser(data["userEmail"])
            
                expire = datetime.datetime.utcnow() + datetime.timedelta(days=3)

                response = make_response( jsonify({"ok":True}) , 200)

                token  = jwt.encode( {"userID": userinfo["id"], "email": userinfo["email"], "exp": expire} , config["jwt_secret_key"])
                        
                response.set_cookie(key="token" , value=token , expires=expire)

                response.headers["Content-Type"] = "application/json"
                        
                return response
            
            else: 

                response = make_response( jsonify({"error":True}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response

        #本身Do it! 平台登入
        elif data["loginRoute"] == 1:

            if data["userEmail"] and data["userPwd"]:

                if usersqlobject.CheckUserfromDoit(data["userEmail"], data["userPwd"]):

                    userinfo = usersqlobject.getUser(data["userEmail"])
            
                    expire = datetime.datetime.utcnow() + datetime.timedelta(days=3)

                    response = make_response( jsonify({"ok":True}) , 200)

                    token  = jwt.encode( {"userID": userinfo["id"], "email": userinfo["email"], "exp": expire} , config["jwt_secret_key"])
                            
                    response.set_cookie(key="token" , value=token , expires=expire)

                    response.headers["Content-Type"] = "application/json"
                            
                    return response
                
                else:

                    response = make_response( jsonify({"error":True}) , 500)
                
                    response.headers["Content-Type"] = "application/json"
                    
                    return response
            
            else: 

                response = make_response( jsonify({"error":True}) , 500)
                
                response.headers["Content-Type"] = "application/json"
                
                return response

    #登出動作
    elif request.method == "DELETE":

        response = make_response( jsonify({"ok":True}) , 200)

        response.set_cookie(key="token", value="", expires=0)

        response.headers["Content-Type"] = "application/json"
        
        return response

    #最後錯誤連線方法
    else:
        return {"error":"Invalid Connection"} , 500   

@app.route("/api/home", methods=["POST", "GET", "PATCH", "DELETE"])
def home():
    
    #home頁面拿user團隊資訊
    if request.method == "GET":
        
        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
    
        data = jwt.decode(cookie, config["jwt_secret_key"] , algorithms=['HS256'])
    
        userinfo = usersqlobject.getUser(data["email"])

        if userinfo:

            teaminfo = teamsqlobject.getAllTeam(userinfo["id"])

            response = make_response( jsonify({"status":"Login", "userinfo":userinfo, "teaminfo":teaminfo}), 200)
            
            response.headers["Content-Type"] = "application/json"

            return response
        
        response = make_response( jsonify({"status":"Logout"}), 500)
            
        response.headers["Content-Type"] = "application/json"

        return response
    
    #創建團隊用
    elif request.method == "PATCH":
        
        cookie = request.cookies.get("token")
        
        data = request.get_json()

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response

        if teamsqlobject.tableInsertTeam(data["teamName"], data["userID"]):

            teaminfo = {
                "teamID": teamsqlobject.getTeamID(data["teamName"], data["userID"]),
                "teamName": data["teamName"],
                "userID": data["userID"]
            }

            response = make_response( jsonify({"teaminfo":teaminfo}) , 200)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
         
@app.route("/api/team", methods=["POST", "PATCH"])
def team():

    #team頁面拿資料
    if request.method == "POST":
        
        teamID = request.get_json()["teamID"]

        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
    
        data = jwt.decode(cookie, config["jwt_secret_key"] , algorithms=['HS256'])

        userinfo = usersqlobject.getUser(data["email"])

        if data:
            
            teaminfo = teamsqlobject.getTeamOnly(data["userID"])

            for leading in teaminfo["leading"]:
                
                if leading["teamID"] == teamID:

                    workinfo = worksqlobject.getLeadingTeam(teamID)
            
            for working in teaminfo["working"]:

                if working["teamID"] == teamID:

                    workinfo = worksqlobject.getWorkingTeam(data["userID"], teamID)

            response = make_response( jsonify({"status":"Login", "userinfo":userinfo, "teaminfo":teaminfo, "workinfo":workinfo}), 200)
            
            response.headers["Content-Type"] = "application/json"

            return response
        
        response = make_response( jsonify({"status":"Logout"}), 500)
            
        response.headers["Content-Type"] = "application/json"

        return response

    elif request.method == "PATCH":

        teamID = request.get_json()["teamID"]
        teamType = request.get_json()["type"]

        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response

        if teamType == 0:

            response = make_response( jsonify({"workinfo": worksqlobject.getLeadingTeam(teamID)}), 200)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
        
        elif teamType == 1:

            userID = request.get_json()["userID"]

            response = make_response( jsonify({"workinfo":worksqlobject.getWorkingTeam(userID, teamID)}), 200 ) 

            response.headers["Content-Type"] = "application/json"
            
            return response

        else: 
            
            response = make_response( jsonify({"status":"logout"}), 200 ) 

            response.headers["Content-Type"] = "application/json"
            
            return response

@app.route("/api/mail", methods=["GET", "POST", "PATCH"])
def mailsend():

    if request.method == "GET":

        args = request.args["token"]

        data = jwt.decode(args, config["jwt_secret_key"] , algorithms=['HS256'])

        cookie = request.cookies.get("token")

        if cookie:

            check_data = jwt.decode(cookie, config["jwt_secret_key"] , algorithms=['HS256'])

            teamID = data["teamID"]

            if data["userEmail"] == check_data["email"]:

                userID = check_data["userID"]

                if teamsqlobject.tableInsertWorkTeam(teamID, userID):

                    return render_template("home.html")
            
            else:
                
                userID = usersqlobject.getUser(data["userEmail"])["id"]
                
                if teamsqlobject.tableInsertWorkTeam(teamID, userID):

                    response = make_response(render_template('index.html'))

                    response.set_cookie(key="token", value="", expires=0)
                    
                    return response

        else:
            
            teamID = data["teamID"]

            if data["status"] == 0:

                return render_template("forgetPwd.html", teamID = teamID, userEmail = userEmail)

            else: 

                userID = usersqlobject.getUser(data["userEmail"])["id"]
                
                if teamsqlobject.tableInsertWorkTeam(teamID, userID):

                    return render_template("index.html")


    elif request.method == "POST":

        data = request.get_json()

        email = data["userEmail"]
        teamID = data["teamID"]
        invitor = data["userName"]
        InviteTeamName = data["InviteTeamName"]
        
        #回傳True代表是有註冊的用戶
        if mailsqlboject.fromEmailCheckUser(email):
            
            token  = jwt.encode({"userEmail": email, "teamID": teamID, "status":1}, config["jwt_secret_key"])

        else:

            token  = jwt.encode({"userEmail": email, "teamID": teamID, "status":0}, config["jwt_secret_key"])

        url = "https://doitouob.com/api/mail?token="+ token
        msg_title = 'Sincerely invite you to join the team'
        msg_sender = ("Do it!", "DoitSender2021@gmail.com")
        msg_recipients = []
        msg_recipients.append(email)
        msg = Message(msg_title, sender=msg_sender, recipients=msg_recipients)
        msg.html = render_template("sendEmail.html", teamName=InviteTeamName, userName=invitor, url=url)
        mail.send(msg)
        
        return "OK"

    elif request.method == "PATCH":

        data = request.get_json()

        status = usersqlobject.tableInsertDoitUser(data["userName"], data["userEmail"], data["userPwd"], data["loginRoute"])

        if status["status"] == 5:

            userID = usersqlobject.getUser(data["userEmail"])["id"]

            if teamsqlobject.tableInsertWorkTeam(data["teamID"], userID):

                expire = datetime.datetime.utcnow() + datetime.timedelta(days=3)

                response = make_response( jsonify({"ok":True}) , 200)

                token  = jwt.encode( {"email": data["userEmail"] , "exp": expire} , config["jwt_secret_key"])

                response.set_cookie(key="token" , value=token , expires=expire)

                response.headers["Content-Type"] = "application/json"
                        
                return response
            
            else: 

                response = make_response( jsonify({"error":"makeTeamError"}) , 400)
                        
                return response

        else:

            response = make_response( jsonify({"error":status["status"]}) , 400)
                        
            return response

@app.route("/api/work", methods=["POST", "PATCH"])
def work():
    #安排工作給使用者
    if request.method == "POST":
        
        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response

        data = request.get_json()

        insert = "\\n".join(request.get_json()["detail"].split("\n"))
        
        response = make_response( jsonify({"data":worksqlobject.tableinsertOutline(data["teamID"], data["userID"], data["date"], data["workTitle"], insert, data["workStatus"])}) , 200)
                
        response.headers["Content-Type"] = "application/json"
        
        return response
    
    #根據使用者回傳各自的工作項目
    elif request.method == "PATCH":

        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
        
        teamID = request.get_json()["teamID"]
        userID = request.get_json()["userID"]
        status = request.get_json()["workStatus"]
        Teamtype = request.get_json()["type"]
 
        if Teamtype == 0:

            response = make_response( jsonify({"data":worksqlobject.filterLeading(teamID, userID, status)}), 200)
                    
            response.headers["Content-Type"] = "application/json"
            
            return response
        
        else:

            response = make_response( jsonify({"data":worksqlobject.filterWorking(teamID, userID, status)}), 200)
                    
            response.headers["Content-Type"] = "application/json"
            
            return response

@app.route("/api/detail/<id>", methods=["GET", "POST", "PATCH"])
def detail(id):

    if request.method == "GET":

        workID = id

        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
        
        response = make_response(jsonify(worksqlobject.getDetail(workID)) , 200)
                
        response.headers["Content-Type"] = "application/json"
        
        return response

    elif request.method == "POST":

        comment = request.get_json()["comment"]
        comment_list = comment.split("\n")
        insert = "\\n".join(comment_list)

        detailID = id
      
        if request.get_json()["type"] == 0:

            if worksqlobject.updateDetail(insert, detailID):

                return "ok", 200

        elif request.get_json()["type"] == 1:

            workID = request.get_json()["workID"]
            date = request.get_json()["date"]
            
            data_to_redis = teamsqlobject.getDataforRedis(workID)
            data_to_redis["type"] = 0
            data_to_redis["date"] = date

            redisObject.ReStoreNot(data_to_redis["leaderID"], 0, data_to_redis, str(date))
            
            if worksqlobject.updateMessage(workID, date, comment):
                
                return "ok", 200

@app.route("/api/upload", methods=["POST"])
def upload():
    
    if request.method == 'POST':
        
        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
        
        data = jwt.decode(cookie, config["jwt_secret_key"] , algorithms=['HS256'])

        userID = data["userID"]

        testfile = request.files["userImg"]

        mimetype = testfile.mimetype
        filename = testfile.filename
        accept_format = ["image/png", "image/jpeg"] 

        if mimetype not in accept_format:

            response = make_response( jsonify({"status":"Unappropriate Data Type"}), 500)
                    
            response.headers["Content-Type"] = "application/json"
            
            return response

        url = s3Object.returnURL(testfile, mimetype, filename)
        
        s3sqlobject.tableInsertUrl(url, userID)

        response = make_response( jsonify({"url":url}), 200)

        response.headers["Content-Type"] = "application/json"
        
        return response

@app.route("/api/notification", methods=["PATCH", "GET"])
def notification():

    if request.method == "PATCH":

        #要放到leading or working 
        not_type = request.get_json()["type"]
        
        if not_type == 0:

            workID = request.get_json()["workID"]
            status = request.get_json()["status"]
            date = request.get_json()["date"]
            
            if worksqlobject.ChangeStatus(workID, status):
                
                if status < 4:

                    data_to_redis = teamsqlobject.getDataforRedis(workID)
                    data_to_redis["type"] = 1
                    data_to_redis["date"] = date

                    redisObject.ReStoreNot(data_to_redis["leaderID"], 0, data_to_redis, str(date))
                    
                    return "ok", 200

                return "ok", 200

    elif request.method == "GET":

        cookie = request.cookies.get("token")

        if not cookie:
            
            response = make_response( jsonify({"status":"Logout"}) , 500)
                
            response.headers["Content-Type"] = "application/json"
            
            return response
        
        data = jwt.decode(cookie, config["jwt_secret_key"] , algorithms=['HS256'])

        userID = data["userID"]

        response = make_response( jsonify({"data": redisObject.ReturnToflask(userID, 0)}) , 200)
                
        response.headers["Content-Type"] = "application/json"
        
        return response


app.run(host="0.0.0.0", port=3000, debug=True)  
