<script setup>
const { ipcRenderer } = window.require('electron');
import { storeToRefs } from 'pinia';
import { onMounted, ref, reactive } from 'vue';
import { useSettingStore } from '../store/settingStore.js';
const { data, setBooksInfo } = useSettingStore()
const { currentBookName } = storeToRefs(useSettingStore())

const shelf = ref(null);
const loading = ref(true)
const books = ref([])
const rows = ref([])
const booksInfo = ref([])

const syncBooksInfo = (bks) => {
    // booksInfo.value = data.booksInfo
    console.log(bks)
    if (data.booksInfo.length > 0) {
        console.log(data.booksInfo)
        setBooksInfo([])
        booksInfo.value = [];
    }
    for (let i = 0; i < bks.length; i++) {
        let bookName = bks[i];
        // 检查该书籍是否已经存在于booksInfo中
        let existingBookInfo = booksInfo.value.find(info => info.bookName === bookName);
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
        booksInfo.value.push(newBookInfo);
    }
    if (booksInfo.value.length) setBooksInfo(booksInfo.value)
}

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const getLocalFiles = () => {
    // 监听从主进程发送的fileContent消息
    ipcRenderer.once('fileContent', (event, data) => {
        // 同步书架，同步至 sysConfig -> booksInfo
        syncBooksInfo(data);
        books.value = data.map(item => {
            return {
                name: item,
                title: item.replace('.txt', '').replace('《', '').replace('》', ''),
                author: 'fish-book',
                ...booksInfo.value.find(book => book.bookName === item),
            };
        });
        initView();
    })
    ipcRenderer.send('readFiles');// 这里先执行
}

const refreshInit = async () => {
    getLocalFiles();
    await initView();
    setTimeout(() => {
        loading.value = false;
    }, 500);
}

const openFolder = () => {
    ipcRenderer.invoke('open-books-folder');
}

const initView = async () => {
    const shelfWidth = shelf.value.offsetWidth;
    const itemWidth = 160;
    const rowCount = Math.floor(shelfWidth / itemWidth);
    let rowIndex = 0;
    let colIndex = 0;
    rows.value = [];
    rows.value[rowIndex] = [];
    books.value.forEach(
        book => {
            const color = getRandomColor();
            rows.value[rowIndex][colIndex] = {
                ...book,
                color,
                hover: false,
            }
            colIndex++;
            if (colIndex >= rowCount) {
                colIndex = 0;
                rowIndex++;
                rows.value[rowIndex] = [];
            }
        }
    )
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
                    icon="refresh" @click="refreshInit">同步书架</el-button>
                <el-popover placement="top-start" title="提示" width="400"
                    trigger="hover">
                    <template #reference>
                        <el-button type="" plain icon="upload">
                            上传小说
                        </el-button>
                    </template>
                    <template #default>
                        您的书架对应您磁盘上的一个名为【books】的文件夹，如果您想要上传小说的话，点击下方蓝色按钮后，只需要把txt文件拖进文件夹，回到软件点击【同步书架】按钮即可。
                        <el-divider></el-divider>
                        <div style="text-align: center">
                            <el-button type="primary" @click="openFolder">
                                打开书架本地文件夹
                            </el-button>
                        </div>
                    </template>
                </el-popover>
            </div>
        </h2>
        <div class="book-shelf" ref="shelf" v-loading="loading" v-show="books.length">
            <div class="shelf-row" v-for="(row, index) in rows" :key="index" v-show="!loading">
                <div v-for="(item, itemIndex) in row" :key="itemIndex" :style="{ backgroundColor: item.color }" :class="{ 'shelf-item': true, active: item.name == currentBookName }">
                    <div class="info">
                        <span class="while-reading" v-if="item.name == currentBookName">
                            阅读中
                        </span>

                        <div class="title" :style="{ color: item.hover ? '#fff' : '#eee' }">
                            {{ item.title }}
                        </div>

                        <div class="progress" v-if="item.bookProgress">
                            已读 {{ item.bookProgress }}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
    width: 80px;
    height: 120px;
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
    font-size: 13px;
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
