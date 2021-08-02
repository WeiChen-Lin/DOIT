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

