## 电子书阅读器

### 1. 读取文件信息, 读入 localstore 中..

    2. localforage
    3. 读取文件, md5文件,然后获取时间戳赋值给key, key为文件名,
       移动到C:\Users\magic\AppData\Roaming\myfish\uploads\book中
    * 封面 cover
    {   //保存书籍名字
        "recentBooks": [
            "1735459625155",
        ],//喜爱的书籍
        "favoriteBooks": [
            "1735459625155"
        ],//阅读记录
        "recordLocation": {
            "1734513402077": {
                "text": "第七十三回n  世族叹陵夷隐迹江村权避祸",
                "chapterTitle": "第七十三回 世族叹陵夷隐迹江村权避祸",
                "chapterDocIndex": "77",
                "chapterHref": "kindle:pos:fid:009R:off:0000000000",
                "count": "1",
                "percentage": "0.5099337748344371",
                "page": ""
            },

        },//设置
        "readerConfig": {
            "isOSNight": "no",
            "appSkin": "system",
            "lang": "zhCN",
            "lastTimeCheck": "1734513046414",
            "appInfo": "dev",
            "isCollapsed": "yes",
            "totalBooks": "3",
            "isNavLocked": "no",
            "viewMode": "cover",
            "highlightIndex": "3"
        },//保存路径
        "storageLocation": "C:Users\magic\AppData\Roaming\koodo-reader\uploads\data",
        //阅读时间
        "readingTime": {
            "1734513402077": 85,
        }
    }

    0:
        author: "天末zz"
        charset: ""
        cover: ""//base64位
        description: ""
        format: "EPUB"
        key: "1735716858370"// key = new Date().getTime() + ""
        md5: "5b10d3f135a86b1a79d1364fd560c803"// 作为一个文件的最终唯一代码 + size一起判断
        name: "孙子兵法曹操注"
        page: 0
        path: "C:\\Users\\HXL\\Desktop\\1epub\\3.epub"
        publisher: ""
        size: 59802

## todolist

### 1. 导入文件 :

-   导入 localforage 中, 书籍信息+封面 cover(base64)
-   复制文件到 C:Users\magic\AppData\Roaming\myfish\data\books 中

### 2. 增删改查.
