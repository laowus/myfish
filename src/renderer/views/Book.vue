<script setup>
const { ipcRenderer } = window.require('electron');
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useSettingStore } from '../store/settingStore.js';
const { data, setBooksInfo } = useSettingStore()
const { currentBookName } = storeToRefs(useSettingStore())

let tipDialogVisible = false, loading = true, activeItem = null
let books = [], rows = [], booksInfo = []

const syncBooksInfo = async (books) => {
    booksInfo = data.booksInfo
    if (!booksInfo) {
        setBooksInfo([])
        booksInfo = [];
    }
    for (let i = 0; i < books.length; i++) {
        let bookName = books[i];
        // 检查该书籍是否已经存在于booksInfo中
        let existingBookInfo = booksInfo.find(info => info.bookName === bookName);
        if (existingBookInfo) {
            continue; // 如果已经存在，则跳过该书籍的处理
        }
        // 如果不存在，则创建一个新的书籍信息对象，并将其添加到booksInfo中
        let newBookInfo = {
            bookName: bookName,
            bookProgress: 0,
            start: 0,
            content: `欢迎使用fish-book当前（${bookName}）`,
            total: -1,
        };
        booksInfo.push(newBookInfo);
        // this.booksInfo = booksInfo;
    }
}

const getLocalFiles = () => {
    // 监听从主进程发送的fileContent消息
    ipcRenderer.once('fileContent', async (event, data) => {
        // 同步书架，同步至 sysConfig -> booksInfo
        console.log(data)
        await syncBooksInfo(data);
    })
    ipcRenderer.send('readFiles');// 这里先执行
}

const refreshInit = async () => {
    getLocalFiles();
    // await this.init();
    setTimeout(() => {
        loading = false;
    }, 500);
}

onMounted(() => {
    refreshInit();
}) 
</script>

<template>
    <div class="book">
        <h2>
            我的书架
            <div class="tools">
                <el-button
                    type=""
                    plain
                    style="margin-right: 10px"
                    icon="refresh">同步书架</el-button>

            </div>
        </h2>
    </div>
</template>

<style scoped lang="scss">
.book {
    padding: 10px 40px;

    .tools {
        float: right;
    }
}

.refresh {
    color: #008aff;
    font-size: 24px;
    cursor: pointer;
}

.refresh:hover {
    color: #0066ff;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.1s;
    transform: scale(1.2);
}

.book-shelf {
    height: 70vh;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    margin: 30px 0;
}

.shelf-row {
    display: flex;
}

.shelf-item {
    width: 160px;
    height: 240px;
    margin: 10px;
    position: relative;
    border-radius: 5px;
    border-bottom: 6px solid #e9eef3;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s;
    /* transform-style: preserve-3d; */
    /* transform-origin: center left; */
    background-size: 100%;
}

.shelf-item.active {
    border-bottom: 6px solid #ff550099;
}

.shelf-item .while-reading {
    position: absolute;
    top: 10px;
    left: 10px;
    color: #777;
    letter-spacing: 1px;
    font-size: 14px;
}

.shelf-item:hover {
    transform: scale(1.2) translateZ(130px);
    z-index: 999;

    .progress {
        display: block;
    }
}

.info {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    transform: translateZ(30px);
    transition: transform 0.3s ease-in-out;
    transform-style: preserve-3d;
    background-color: rgba(0, 0, 0, 0.7);
    backface-visibility: hidden;
}

.title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 10px;
    margin-bottom: 5px;
    transition: color 0.3s ease-in-out;
    line-height: 26px;
    letter-spacing: 1px;
}

.author {
    font-size: 14px;
    color: #666;
}

.progress {
    position: absolute;
    bottom: 6px;
    right: -16px;
    font-size: 12px;
    letter-spacing: 1px;
    display: none;
    color: #fff;
}

.popover-content {
    text-align: left;
    margin: 0;
    line-height: 26px;

    button {
        margin: 0 auto;
    }
}
</style>
