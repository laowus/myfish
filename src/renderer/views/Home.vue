<script setup>
import localforage from 'localforage';
import { ref, onMounted, toRaw } from 'vue'
import { fetchMD5 } from '../utils/fileUtils/md5Util'
import BookUtil from '../utils/fileUtils/bookUtils'
import { ElMessage } from 'element-plus';
import PaginationTiles from '../components/PaginationTiles.vue';

const dialogFormVisible = ref(false);
let fileList = [];
let booklist = ref([]);
let clickFilePath = "";
const getFiles = () => {
    if (fileList.length > 0) {
        fileList.map(async (file) => { await getMd5WithBrowser(file.raw) })
    }
}

const getMd5WithBrowser = async (file) => {
    return new Promise(async (resolve, reject) => {
        const md5 = await fetchMD5(file);
        if (!md5) {
            ElMessage.error(' <<' + bookName + '>> md5失败!');
            return resolve();
        } else {
            try {
                await handleBook(file, md5);
            } catch (error) {
                console.log(error);
            }
            return resolve();
        }
    })
}

const handleBook = (file, md5) => {
    console.log('handleBook', file, md5)
    let extension = (file.name).split(".").reverse()[0].toLocaleLowerCase();
    let bookName = file.name.substr(0, file.name.length - extension.length - 1);
    let result;
    return new Promise((resolve, reject) => {
        let isRepeat = false;
        if (booklist.value.length > 0) {
            console.log("booklist.foreach");
            booklist.value.forEach((item) => {
                if (item.md5 === md5 && item.size === file.size) {
                    isRepeat = true;
                    ElMessage.error('<<' + bookName + '>> 已经存在!');
                    return resolve();
                }
            });
        }
        if (!isRepeat) {
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async (e) => {
                if (!e.target) {
                    ElMessage.error(' <<' + bookName + '>> 导入失败!');
                    return resolve();
                }
                let reader = new FileReader();
                reader.onload = async (event) => {
                    const file_content = event.target.result;
                    try {
                        result = await BookUtil.generateBook(bookName, extension, md5, file.size, file.path || clickFilePath, file);
                    } catch (error) {
                        console.log(error);
                        throw error;
                    }
                    clickFilePath = "";
                    if (result === "get_metadata_error") {
                        ElMessage.error('导入 <<' + bookName + '>> 失败!');
                        return resolve();
                    }
                    await handleAddBook(result, file_content);
                    return resolve();
                }
                reader.readAsArrayBuffer(file);
            }
        }
    })
}

const handleAddBook = (book, buffer) => {
    console.log(" handleAddBook ", book);
    return new Promise((resolve, reject) => {
        BookUtil.addBook(book.key, buffer);//复制文件
        booklist.value.push(book);
        const books = toRaw(booklist.value)
        console.log(books)
        localforage.setItem("books", books).then(() => {
            ElMessage.success('导入 <<' + book.name + '>> 成功!');
        }).catch(() => {
            ElMessage.error('导入 <<' + book.name + '>> 失败!');
        });
        return resolve();
    })
}

const handleChange = (file, uploadFiles) => {
    fileList = uploadFiles;
}

const handleRemove = (file, uploadFiles) => {
    fileList = uploadFiles;
}

onMounted(() => {
    loadContent()
});
const setImageTextTileSize = () => {
    const tileMinWidth = 165;
    const tileHMargin = 12.5;
    const mainMargin = 33;
    const scrollBarWidth = 6;
    const limits = [5, 4];
    const mainContent = document.getElementById('main-content');
    const { clientWidth } = mainContent;
    const minWidths = limits.map(item => item * (tileMinWidth + tileHMargin * 2) + mainMargin * 2 + scrollBarWidth);
    const tileCovers = document.querySelectorAll(".image-text-tile .cover");
    const tileTitles = document.querySelectorAll(".image-text-tile .title");
    let tileWidth = 165, limit = 0;
    if (clientWidth > minWidths[0]) {
        limit = limits[0];
    } else if (clientWidth > minWidths[1]) {
        limit = limits[1];
    }
    if (limit > 0) tileWidth = (clientWidth - 2 * mainMargin - scrollBarWidth) / limit - tileHMargin * 2;
    tileCovers.forEach(item => {
        item.style.width = tileWidth + "px";
        item.style.height = tileWidth + "px";
    })
    tileTitles.forEach(item => {
        item.style.width = tileWidth + "px";
    })
}

const loadContent = () => {
    localforage.getItem("books").then((books) => {
        booklist.value = books ? books : [];
        console.log(booklist.value);
    });
}

</script>
<template>
    <div class="book">
        <!-- 弹出层 -->
        <div class="container">
            <el-dialog
                v-model="dialogFormVisible" title="导入书籍" width="500" draggable>
                <el-upload
                    class="upload-demo" drag action="#" accept=".epub,.mobi,.azw3"
                    :auto-upload="false"
                    :on-remove="handleRemove"
                    :on-change="handleChange"
                    multiple>
                    <el-icon class="el-icon--upload">
                        <upload-filled />
                    </el-icon>
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            格式 : epub / mobi / azw3
                        </div>
                    </template>
                </el-upload>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogFormVisible = false">
                            取消
                        </el-button>
                        <el-button type="primary" @click="getFiles">
                            确认
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
        <h3>
            我的书架
            <div class="tools">
                <el-button class="ml-3" type="success" @click="dialogFormVisible = true">
                    导入书籍
                </el-button>
            </div>
            <div id="main-content">
                <div class="playlists-ctl">
                    <PaginationTiles>
                        <ImageTextTile v-for="item in booklist" :cover="item.cover" :title="item.name">
                        </ImageTextTile>
                    </PaginationTiles>
                </div>
            </div>
        </h3>
    </div>
</template>

<style scoped lang="scss">
.book {
    padding: 10px 20px;

    .tools {
        float: right;

        .el-upload__tip {
            text-align: center;
        }

    }

    .booklist {
        float: left;
        padding-top: 50px;
    }

}

#main-content {
    display: flex;
    flex: 1;
    overflow: auto;
    /*margin-right: 2px;*/
}

.playlists-ctl {
    margin-top: 15px;
}
</style>