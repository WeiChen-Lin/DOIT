from redis import Redis
import json

class ReOper:

    def __init__(self):
        
        self.r = Redis(host="127.0.0.1", port=6379)
          
    def handleRedis(self, target):

        return_list = []

        if target == None:

            return return_list

        for i in target.split(","):

            return_list.append(str(i.split("'")[1]))

        return return_list

    def HashSetdata(self, userID, nottype, data):

        key = "userID_" + str(userID) + "_not"
        
        if nottype == 0:
            
            field = "leading" 

            self.r.hset(key, field, data)

    def HashGetdata(self, userID, nottype):

        key = "userID_" + str(userID) + "_not"

        if nottype == 0:

            field = "leading" 

            return_data = self.r.hget(key, field)

            if return_data:

                return return_data.decode()

        return return_data

    #兩個禮拜秒數 1209600

    #通知來以hash set 進leading這個field內
    def ReStoreNot(self, userID, nottype, data, date):

        input_key = str(userID) + "_not_" + date
        self.r.set(input_key, data)
        self.r.expire(input_key, 1209600)

        if self.HashGetdata(userID, nottype):

            not_list = []

            for lists in self.HashGetdata(userID, nottype).split(","):

                not_list.append(str(lists.split("'")[1]))
            
            if input_key not in not_list:

                not_list.append(input_key)

                self.HashSetdata(userID, nottype, not_list)
        
        else:

            not_list = []

            not_list.append(input_key)

            self.HashSetdata(userID, nottype, not_list)

    def ReturnToflask(self, userID, nottype):

        data_list = self.handleRedis(self.HashGetdata(userID, nottype))
        
        not_list = []

        for data in data_list:

            if not self.r.get(data):

                data_list.remove(data)
            
            else:

                not_list.append(json.loads(self.r.get(data).decode().replace("'", '"')))

        return not_list

    def Getpubsub(self):

        return self.r.pubsub()
