import mysql.connector
from mysql.connector import pooling
import re

class UserSQL:

    def __init__(self , config):
        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "userpool", **config)
        
    def tableInsertFBUser(self, username, userEmail, loginRoute, loginID):
        
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        #建立資料庫insert相關命令

        insert_command = ("insert into userinfo (username, userEmail, loginRoute, loginID)"
        " Values (%s, %s, %s, %s);" ) 
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command , (username, userEmail, loginRoute, loginID,))
            self.conn.commit()

        self.conn.close()
    
    def tableInsertDoitUser(self, username, userEmail, userPwd, loginRoute):
        
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        username_command = "select count(*) from userinfo where username=%s;"
        useremail_command = "select count(*) from userinfo where userEmail=%s;"

        #先確定email及username有沒有重複
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(username_command , (username,))
            name_check = cursor.fetchone()

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(useremail_command , (userEmail,))
            email_check = cursor.fetchone()  
    
        if name_check[0] != 0:

            self.conn.close()
            
            return {"status":1}
        
        elif email_check[0] != 0:

            self.conn.close()

            return {"status":2}
        
        else:
            
            email_re = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
            pwd_re = "^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$"

            if re.match(email_re, userEmail):

                if re.match(pwd_re, userPwd):

                    #建立資料庫insert相關命令
                    insert_command = ("insert into userinfo (username, userEmail, userPwd, loginRoute)"
                    " Values (%s, %s, %s, %s);" ) 
                    
                    with self.conn.cursor(buffered=True) as cursor:
                        cursor.execute(insert_command , (username, userEmail, userPwd, loginRoute,))
                        self.conn.commit()

                    self.conn.close()

                    return {"status":5}

                else:
                    
                    self.conn.close()

                    return {"status":4}

            else:
                
                self.conn.close()

                return {"status":3}

    def getUser(self, userEmail):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        #建立資料庫get userinfo

        command = ("select userID, username, imgurl from userinfo where userEmail = %s") 
        
        data = None

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command, (userEmail,))
            data = cursor.fetchone()
            
            if data:

                data = {"id":data[0], "name":data[1], "email":userEmail, "imgurl":data[2]}

        self.conn.close()

        return data
            
    def CheckUserfromFB(self, userEmail, loginID): 

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()      

        command = ("select userEmail from userinfo where loginID = %s") 
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command, (loginID, ))
            data = cursor.fetchone()

        self.conn.close()

        if data:

            if userEmail == data[0]:
                
                return True
            
            else:

                return None
        else: 

            return None

    def CheckUserfromDoit(self, userEmail, userPwd): 

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()      

        command = "select count(*) from userinfo where userEmail = %s;"
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command, (userEmail,))
            email_check = cursor.fetchone()

        if email_check[0] == 1:
            
            pwd_command = "select userpwd from userinfo where userEmail = %s;"
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(pwd_command, (userEmail,))
                pwd_check = cursor.fetchone()
            
            if pwd_check[0] == userPwd:
                
                self.conn.close()

                return True
            
            else: 

                self.conn.close()

                return None

        else:

            self.conn.close()

            return None

class TeamSQL:

    def __init__(self , config):
        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "teampool", **config)

    def tableInsertTeam(self, teamName, userID):   

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = "insert into team (teamName, userID) Values (%s, %s);" 

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (teamName, userID,))
            self.conn.commit()

        self.conn.close()

        return True
    
    def tableInsertWorkTeam(self, teamID, userID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()      
        check_command = "select count(*) from worker where teamID = %s and userID = %s"
        
        with self.conn.cursor(buffered=True) as cursor:
                    cursor.execute(check_command, (teamID, userID, ))
                    count = cursor.fetchone()
        if count[0] == 0: 

            command = "insert into worker (teamID, userID) Values (%s, %s);"
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(command, (teamID, userID, ))
                self.conn.commit()

            self.conn.close()

            return True 
        
        else:

            self.conn.close()

            return True

    def getTeamID(self, teamName, userID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = "select teamID from team where teamName = %s and userID = %s;" 

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (teamName, userID,))
            data = cursor.fetchone()

        self.conn.close()

        return data[0]

    def getAllTeam(self, userID):
        
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        getleading_command = "select teamID, teamName from team where userID = %s;"
        getleading_count = "select count(*) from worker where teamID = %s;"

        user_team_info = {}
        leading = []
        working = []
         
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(getleading_command , (userID,))
            leading_data = cursor.fetchall()

            if leading_data:
                
                for team in leading_data:
                    
                    teaminfo = {}
                    teaminfo["teamID"] = team[0]
                    teaminfo["teamName"] = team[1]

                    with self.conn.cursor(buffered=True) as cursor:
                        cursor.execute(getleading_count, (team[0],))
                        leading_count = cursor.fetchone()

                        teaminfo["count"] = leading_count[0] + 1

                        leading.append(teaminfo) 
                
                user_team_info["leading"] = leading
            
            else:

                user_team_info["leading"] = leading

        getworking_command = ("select worker.teamID, team.teamName from worker"
        " left join team on team.teamID = worker.teamID"
        " where worker.userID = %s;")

        getworking_count = "select count(*) from worker where teamID = %s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(getworking_command, (userID,))
            working_data = cursor.fetchall()

            if working_data:

                for team in working_data:

                    teaminfo = {}
                    teaminfo["teamID"] = team[0]
                    teaminfo["teamName"] = team[1]

                    with self.conn.cursor(buffered=True) as cursor:
                        cursor.execute(getworking_count, (team[0],))
                        working_count = cursor.fetchone()

                        teaminfo["count"] = working_count[0] + 1

                        working.append(teaminfo)
                
                user_team_info["working"] = working
            
            else:

                user_team_info["working"] = working
        
        self.conn.close()

        return user_team_info

    def getTeamOnly(self, userID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        getleading_command = "select teamID, teamName from team where userID = %s;"

        user_team_info = {}
        leading = []
        working = []
         
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(getleading_command , (userID,))
            leading_data = cursor.fetchall()

            if leading_data:
                
                for team in leading_data:
                    
                    teaminfo = {}
                    teaminfo["teamID"] = team[0]
                    teaminfo["teamName"] = team[1]

                    leading.append(teaminfo) 
                
                user_team_info["leading"] = leading
            
            else:

                user_team_info["leading"] = leading

        getworking_command = ("select worker.teamID, team.teamName from worker"
        " left join team on team.teamID = worker.teamID"
        " where worker.userID = %s;")

        getworking_count = "select count(*) from worker where teamID = %s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(getworking_command, (userID,))
            working_data = cursor.fetchall()

            if working_data:

                for team in working_data:

                    teaminfo = {}
                    teaminfo["teamID"] = team[0]
                    teaminfo["teamName"] = team[1]

                    working.append(teaminfo)
                
                user_team_info["working"] = working
            
            else:

                user_team_info["working"] = working
        
        self.conn.close()

        return user_team_info

    def getDataforRedis(self, workID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = ("select team.userID, team.teamName, workoutline.workTitle, userinfo.username"
                    " from workoutline"
                    " left join team on workoutline.teamID = team.teamID"
                    " left join userinfo on workoutline.userID = userinfo.userID"
                    " where workoutline.workID = %s;")

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command, (workID,))
            data = cursor.fetchone()

        return_data = {}
        return_data["leaderID"] = data[0]
        return_data["teamName"] = data[1]
        return_data["workTitle"] = data[2]
        return_data["workerName"] = data[3]

        self.conn.close() 

        return return_data 
        
class WorkSQL:

    def __init__(self, config):

        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "workpool", **config)
    
    def getUserName(self, userID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = "select username from userinfo where userID = %s"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (userID,))
            data = cursor.fetchone()

        self.conn.close()    

        return data[0]

    def getLeadingTeam(self, teamID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = ("select workoutline.workID, workoutline.userID, workoutline.date, workoutline.workTitle, workoutline.workStatus, userinfo.username, userinfo.imgurl" 
        " from workoutline"
        " left join userinfo on workoutline.userID = userinfo.userID"
        " where workoutline.teamID = %s;")

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (teamID,))
            data = cursor.fetchall()

        self.conn.close()

        return_data = {}
        data_list = []

        if data:

            for work in data:
                
                workoutline = {}
                workoutline["workID"] = work[0]
                workoutline["userID"] = work[1]
                workoutline["date"] = work[2]
                workoutline["workTitle"] = work[3]
                workoutline["workStatus"] = work[4]
                workoutline["workername"] = work[5]
                workoutline["imgurl"] = work[6]

                data_list.append(workoutline)

            return_data["workoutline"] = data_list
            return_data["worker"] = self.getWorkers(teamID)
            return_data["type"] = 0
            
            return return_data 
        
        else:
            return_data["workoutline"] = data_list
            return_data["worker"] = self.getWorkers(teamID)
            return_data["type"] = 0

            return return_data 
    
    def getWorkingTeam(self, userID, teamID):
        
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = ("select workoutline.workID, workoutline.userID, workoutline.date, workoutline.workTitle, workoutline.workStatus, userinfo.username, userinfo.imgurl" 
        " from workoutline"
        " left join userinfo on workoutline.userID = userinfo.userID"
        " where workoutline.teamID = %s and workoutline.userID = %s;")

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (teamID, userID,))
            data = cursor.fetchall()

        self.conn.close()

        return_data = {}
        data_list = []

        if data:

            for work in data:
                
                workoutline = {}
                workoutline["workID"] = work[0]
                workoutline["userID"] = work[1]
                workoutline["date"] = work[2]
                workoutline["workTitle"] = work[3]
                workoutline["workStatus"] = work[4]
                workoutline["workername"] = work[5]
                workoutline["imgurl"] = work[6]

                data_list.append(workoutline)

            return_data["workoutline"] = data_list
            return_data["type"] = 1
            
            return return_data 
        
        else:
            return_data["workoutline"] = data_list
            return_data["type"] = 1

            return return_data 
        
    def getWorkdetail(self, workID):

        self.conn = self.conn_pool.get_connection()

        command = "select detail, comment, date, detailID from workdetail where workID = %s order by date desc;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (workID, ))
            data = cursor.fetchall()
        
        self.conn.close()

        return_data = {}
        data_list = []

        if data:

            for work in data:

                work_dict = {}
                work_dict["detail"] = work[0]
                work_dict["comment"] = work[1]
                work_dict["date"] = work[2]
                work_dict["deatailID"] = work[3]

                data_list.append(work_dict)

            return_data["workdetail"] = data_list

        else: 

            return_data["workdetail"] = data_list
        
        return return_data

    def getWorkers(self, teamID):
        
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        getworker = ("select worker.userID, userinfo.username, userinfo.imgurl from worker"
        " left join userinfo on worker.userID = userinfo.userID"
        " where worker.teamID = %s;")

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(getworker , (teamID,))
            worker = cursor.fetchall()
        
        self.conn.close()

        return_data = []

        if worker:
            
            for i in worker:
                
                worker = {}
                
                worker["userID"] = i[0]
                worker["userName"] = i[1]
                worker["imgurl"] = i[2]
                
                return_data.append(worker)
        
        return return_data

    def tableinsertOutline(self, teamID, userID, date, workTitle, detail, workStatus):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = ("insert into workoutline (teamID, userID, date, workTitle, detail, workStatus)" 
                " Values (%s, %s, %s, %s, %s, %s);") 

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (teamID, userID, date, workTitle, detail, workStatus,))
            self.conn.commit()
        
        usercommand = ("select userinfo.username, userinfo.imgurl, workoutline.workID from userinfo"
                        " left join workoutline on userinfo.userID = workoutline.userID"
                        " where workoutline.date = %s;")

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(usercommand , (date,))
            info = cursor.fetchone()

        self.conn.close()

        return {"username":info[0], "imgurl":info[1], "workID":info[2]}

    def getDetail(self, workID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = "select detail, fileUrl from workoutline where workID = %s" 

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (workID,))
            data = cursor.fetchone()

        comment_command = "select detailID, date, message, comment from workdetail where workID = %s;"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(comment_command , (workID,))
            comment = cursor.fetchall()

        return_data = {}
        return_data["detail"] = data[0]
        return_data["fileUrl"] = data[1]
        data_list = []
        
        if comment:
            
            for com in comment:
                box = {}
                box["detailID"] = com[0]
                box["date"] = com[1]
                box["message"] = com[2]
                box["comment"] = com[3]
                data_list.append(box)

            return_data["communication"] = data_list
        
        else: 
            
            return_data["communication"] = data_list
            

        self.conn.close()

        return return_data

    def updateDetail(self, comment, detailID):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = "update workdetail set comment = %s where detailID = %s;" 

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (comment, detailID,))
            self.conn.commit()

        self.conn.close()
        
        return True
    
    def updateMessage(self, workID, date, message):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = "insert into workdetail (workID, date, message) values (%s, %s, %s);" 

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (workID, date, message,))
            self.conn.commit()

        self.conn.close()
        
        return True
    
    #Leading 區塊篩選工作者及工作狀態   
    def filterLeading(self, teamID, userID, workStatus):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        user_command = ("select workoutline.workID, workoutline.userID, workoutline.date, workoutline.workTitle, workoutline.workStatus, userinfo.username, userinfo.imgurl" 
        " from workoutline"
        " left join userinfo on workoutline.userID = userinfo.userID"
        " where workoutline.teamID = %s and workoutline.userID = %s;")

        user_command_Difstatus = ("select workoutline.workID, workoutline.userID, workoutline.date, workoutline.workTitle, workoutline.workStatus, userinfo.username, userinfo.imgurl" 
        " from workoutline"
        " left join userinfo on workoutline.userID = userinfo.userID"
        " where workoutline.teamID = %s and workoutline.userID  = %s and workoutline.workStatus = %s;")

        all_user_status = ("select workoutline.workID, workoutline.userID, workoutline.date, workoutline.workTitle, workoutline.workStatus, userinfo.username, userinfo.imgurl" 
        " from workoutline"
        " left join userinfo on workoutline.userID = userinfo.userID"
        " where workoutline.teamID = %s;")

        all_user_Difstatus = ("select workoutline.workID, workoutline.userID, workoutline.date, workoutline.workTitle, workoutline.workStatus, userinfo.username, userinfo.imgurl" 
        " from workoutline"
        " left join userinfo on workoutline.userID = userinfo.userID"
        " where workoutline.teamID = %s and workoutline.workStatus = %s;")
  
        #不篩選user
        if userID == "0":

            #不篩選工作狀態
            if workStatus == 4:
   
                with self.conn.cursor(buffered=True) as cursor:
                    cursor.execute(all_user_status , (teamID,))
                    data = cursor.fetchall()

            #選定工作狀態，
            else: 

                with self.conn.cursor(buffered=True) as cursor:
                    cursor.execute(all_user_Difstatus , (teamID, workStatus,))
                    data = cursor.fetchall()
                
        else:

            if workStatus != 4:

                #篩選user，不篩選工作狀態
                with self.conn.cursor(buffered=True) as cursor:
                    cursor.execute(user_command_Difstatus , (teamID, userID, workStatus))
                    data = cursor.fetchall()

            else:
       
                #篩選user，並且篩選工作狀態
                with self.conn.cursor(buffered=True) as cursor:
                    cursor.execute(user_command, (teamID, userID))
                    data = cursor.fetchall()


        self.conn.close()

        return_data = {}
        data_list = []

        if data:

            for work in data:
                
                workoutline = {}
                workoutline["workID"] = work[0]
                workoutline["userID"] = work[1]
                workoutline["date"] = work[2]
                workoutline["workTitle"] = work[3]
                workoutline["workStatus"] = work[4]
                workoutline["workername"] = work[5]
                workoutline["imgurl"] = work[6]

                data_list.append(workoutline)

            return_data["workoutline"] = data_list
            return_data["type"] = 0
            
            return return_data 
        
        else:

            return_data["workoutline"] = data_list
            return_data["type"] = 0

            return return_data 

    #Working 區塊篩選工作者及工作狀態
    def filterWorking(self, teamID, userID, workStatus):
        
        self.conn = self.conn_pool.get_connection()

        command = "select workID, date, workTitle, workStatus from workoutline where teamID = %s and userID = %s;"
        
        filterCommand = "select workID, date, workTitle, workStatus from workoutline where teamID = %s and userID = %s and workStatus = %s;"
    
        if workStatus == 4:
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(command , (teamID, userID, ))
                data = cursor.fetchall()
        
        else: 
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(filterCommand , (teamID, userID, workStatus,))
                data = cursor.fetchall()
        
        self.conn.close()
        
        return_data = {}
        data_list = []

        if data:
            
            username = self.getUserName(userID)

            for work in data:

                workoutline = {}
                workoutline["workID"] = work[0]
                workoutline["workername"] = username
                workoutline["date"] = work[1]
                workoutline["workTitle"] = work[2]
                workoutline["workStatus"] = work[3]

                data_list.append(workoutline)

            return_data["workoutline"] = data_list
            return_data["type"] = 1
            
            return return_data 
        
        else:

            workoutline = {}
            return_data["workoutline"] =data_list
            return_data["type"] = 1

            return return_data 

    def ChangeStatus(self, workID, status):
        
        self.conn = self.conn_pool.get_connection()

        command = "update workoutline set workStatus = %s where workID = %s;"
        
        if status < 4:

            if status == 1:
                
                update = 2
            
            elif status == 2:

                update = 0

            elif status == 3:
                
                update = 1
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(command , (update, workID, ))
                self.conn.commit()

        else:

            delete_detail = "delete from workdetail where workID = %s;"
            delete_work = "delete from workoutline where workID = %s;"
            
            with self.conn.cursor(buffered=True) as cursor:
                cursor.execute(delete_detail , (workID, ))
                cursor.execute(delete_work, (workID,))
                self.conn.commit()

        self.conn.close()

        return True
            
class MailSQL:

    def __init__(self , config):

        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "mailpool", **config)

    def fromEmailCheckUser(self, userEmail):

        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        command = "select userID from userinfo where userEmail=%s"

        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(command , (userEmail,))
            data = cursor.fetchone()

        self.conn.close()    

        if data:

            return True
        else:

            return False 

class S3_SQL:

    def __init__(self , config):
        # 資料庫參數設定
        self.conn_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name = "s3pool", **config)
        
    def tableInsertUrl(self, url, userID):
        
        # 建立Connection物件
        self.conn = self.conn_pool.get_connection()

        insert_command = "update userinfo set imgurl = %s where userID = %s;"
        
        with self.conn.cursor(buffered=True) as cursor:
            cursor.execute(insert_command , (url, userID,))
            self.conn.commit()

        self.conn.close()