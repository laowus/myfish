<script setup>
import localforage from 'localforage';
import { ref, onMounted, toRaw } from 'vue';
import { fetchMD5 } from '../utils/fileUtils/md5Util';
import BookUtil from '../utils/fileUtils/bookUtils';
import { ElMessage } from 'element-plus';
import PaginationTiles from '../components/PaginationTiles.vue';
import { InfoFilled } from '@element-plus/icons-vue';

const dialogFormVisible = ref(false);
const delBtnVisible = ref(false);
const booklist = ref([]);
const filelistRef = ref([]);
let fileList = [];
let clickFilePath = "";

//上传
const getFiles = () => {
    if (fileList.length > 0) {
        fileList.map(async (file) => { await getMd5WithBrowser(file.raw) })
    }
}
//关闭上传弹窗
const closeUpload = () => {
    filelistRef.value = [];
    dialogFormVisible.value = false;
}

const delAllEvent = () => {
    //删除所有文件
    BookUtil.deleteAllFiles();
    localforage.removeItem("books");
    console.log("删除完成!");
    booklist.value = [];
}
const cancelEvent = () => {
    console.log('cancel!')
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
    let extension = (file.name).split(".").reverse()[0].toLocaleLowerCase();
    let bookName = file.name.substr(0, file.name.length - extension.length - 1);
    let result;
    return new Promise((resolve, reject) => {
        let isRepeat = false;
        if (booklist.value.length > 0) {
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
    return new Promise((resolve, reject) => {
        BookUtil.addBook(book.key, buffer);//复制文件
        booklist.value.push(book);
        const books = toRaw(booklist.value)
        localforage.setItem("books", books).then(() => {
            ElMessage.success('导入 <<' + book.name + '>> 成功!');
            filelistRef.value = []
            dialogFormVisible.value = false
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

const loadContent = () => {
    localforage.getItem("books").then((books) => {
        booklist.value = books ? books : [];
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
                    :auto-upload="false" :on-remove="handleRemove" :on-change="handleChange"
                    :file-list="filelistRef" multiple>
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
                        <el-button @click="closeUpload">
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
                <el-button type="success" @click="dialogFormVisible = true">
                    <el-icon class="el-icon--right">
                        <Upload />
                    </el-icon> 导入书籍
                </el-button>
                <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" :icon="InfoFilled" icon-color="#626AEF" title="确定删除所有书籍吗?" @confirm="delAllEvent" @cancel="cancelEvent">
                    <template #reference>
                        <el-button type="danger" v-show="booklist.length > 0">
                            <el-icon class="el-icon--right">
                                <Delete />
                            </el-icon> 删除所有
                        </el-button>
                    </template>
                </el-popconfirm>

            </div>
        </h3>
        <div id="main-content">
            <div class="playlists-ctl">
                <PaginationTiles>
                    <ImageTextTile v-for="item in booklist" :cover="item.cover" :title="item.name">
                    </ImageTextTile>
                </PaginationTiles>
            </div>
        </div>

    </div>
</template>

<style scoped lang="scss">
.el-icon--right {
    margin-right: 5px;
}

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