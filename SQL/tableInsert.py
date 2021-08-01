import mysql.connector

test = mysql.connector.connect(**config)

TABLES = {}

TABLES["userinfo"] = (
    "create table userinfo ("
    " username varchar(50) not null,"
    " userID int primary key auto_increment not null,"
    " userEmail varchar(50) not null,"
    " userpwd varchar(20),"
    " loginRoute varchar(5) not null,"
    " imgurl varchar(200));"
)

TABLES["team"] = (
    "create table team ("
    " teamID int primary key auto_increment not null,"
    " teanName varchar(50) not null,"
    " userID int not null,"
    " FOREIGN KEY (userID) REFERENCES userinfo(userID));"
)

TABLES["worker"] = (
    "create table worker ("
    " teamID int not null,"
    " userID int not null,"
    " FOREIGN KEY (userID) REFERENCES userinfo(userID),"
    " FOREIGN KEY (teamID) REFERENCES team(teamID));"
)

TABLES["workoutline"] = (
    "create table workoutline ("
    " workID int primary key auto_increment not null,"
    " teamID int not null,"
    " userID int not null,"
    " date varchar(20) not null,"
    " workTitle varchar(200) not null,"
    " workStatus varchar(5) not null,"
    " FOREIGN KEY (userID) REFERENCES userinfo(userID),"
    " FOREIGN KEY (teamID) REFERENCES team(teamID));"
)

TABLES["workdetail"] = (
    "create table workdetail ("
    " workID int not null,"
    " detail text not null,"
    " comment text,"
    " fileUrl varchar(200),"
    " date varchar(20) not null,"
    " FOREIGN KEY (workID) REFERENCES workoutline(workID));"
)

# cursor = test.cursor()
# cursor.execute(TABLES["workdetail"])