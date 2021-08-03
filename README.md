# [Do it!](https://doitouob.com)

### 設計理念

![Doit設計理念](https://user-images.githubusercontent.com/60848391/127813772-9b303588-0d36-43ea-a6ca-c3aba4034396.png)

老闆交代工作，員工提交進度，看似簡單，但人一多或交代的事情一多就會有些問題產生，例如
1. 老闆忘記自己交代了哪些工作，或是員工忘記自己被交代了哪些工作
2. 員工提交進度，老闆沒有查看反而懷疑員工偷雞摸狗

為了解決這個問題而設計出了Do it!這個平台，讓雙方都可以掌握彼此的進度，讓溝通更順利。

### 使用技術

* Python Flask
* 以RESTful API架構實現
* 串接FB API實現FB第三方登入
* SMTP進行email 邀請加入團隊
* 使用Redis存取通知，確認完成後可以將通知刪除
* 以S3儲存使用者上傳的大頭貼
* 申請SSL憑證實踐HTTPS

### 系統架構圖

![系統架構圖](https://user-images.githubusercontent.com/60848391/127816439-e55aa085-b09e-4c95-b8c8-0d23f7569c24.png)

### MySQL架構圖

![mysql架構圖2](https://user-images.githubusercontent.com/60848391/127818729-4eacc077-5ca3-4f37-81af-0d44022a916c.png)

## 功能介紹

### 首頁進行帳號登入及註冊

![首頁](https://user-images.githubusercontent.com/60848391/127956269-1218844f-1466-41b0-b6fd-750ff32d4156.png)

首頁可進行登入及註冊，目前支援FB實現第三方登入。
註冊會進行檢查
* email需輸入合法email地址(確保收的到信)
* 使用者名稱會檢查是否有重複
* 密碼需輸入英文大小寫及數字共8位進行註冊

### 團隊總覽

![團隊總攬](https://user-images.githubusercontent.com/60848391/127984859-eafae573-1d6c-4154-9478-232fba83b58e.png)

1. 可查看個人資料
2. Leading team為您所帶領的團隊，可以邀請其他人加入您的團隊，並且安排工作給團隊內的工作者。
3. Working team為您所加入的團隊，可以查看其團隊領導者指派給您的工作。

* 點擊團隊的畫面即會進入團隊內工作頁面。

### 工作頁面




