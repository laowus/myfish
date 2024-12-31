<script setup>
import { ref, onMounted } from 'vue'
import { fetchMD5 } from '../utils/fileUtils/md5Util'
import { makeBook } from '../libs/reader'
import Book from "../models/Book";
const { ipcRenderer } = window.require('electron');
const dialogFormVisible = ref(false);
let book, cover
const coverRef = ref("")
const testBook = async (book) => {
    if (typeof book === 'string'
        || typeof book.arrayBuffer === 'function'
        || book.isDirectory) book = await makeBook(book)
    cover = await book.getCover()
    if (cover) {
        // cover is a blob, so we need to convert it to base64
        const fileReader = new FileReader()
        fileReader.readAsDataURL(cover)
        fileReader.onloadend = () => {
            cover = fileReader.result
            console.log(cover)
            coverRef.value = cover
        }
    }

}

let fileList = []
const getFiles = () => {
    if (fileList.length > 1) {
        fileList.map(
            file => {
                getMd5WithBrowser(file)
            }
        )
    }

}

const handleChange = (file, uploadFiles) => {
    fileList = uploadFiles
}

const handleRemove = (file, uploadFiles) => {
    fileList = uploadFiles
}
//处理导入文件
const handleBook = (file, md5) => {
    //格式, 如epub
    let extension = file.name.split(".").reverse()[0].toLocalLowerCase()
    //文件名 如xx.epub, xx
    let bookName = file.name.substr(0, file.name.length - extension.length - 1)
    let result
    return new Promise((resolve, reject) => {
        let isRepeat = false
        if (!isRepeat) {
            let reader = new FileReader()
            reader.readAsArrayBuffer(file);
            reader.onload = async (e) => {
                if (!e.target) {
                    console.log("导入", bookName, "失败")
                    return resolve();
                }
                let reader = new FileReader()
                reader.onload = async (event) => {
                    const file_content = (event.target).result
                    try {
                        result = await new Book(

                        )

                    } catch (error) {
                        console.log(error);
                        throw error;
                    }
                    if (result === "get_metadata_error") {
                        console.log("导入", bookName, "失败")
                        return resolve()
                    }
                    await handleAddBook()
                    return resolve();
                }
                reader.readAsArrayBuffer(file);
            }
        }
    })
}

const handleAddBook = (book, buffer) => {
    return new Promise((resolve, reject) => {

    })
}

const getMd5WithBrowser = async (file) => {
    return new Promise(async (resolve, reject) => {
        const md5 = await fetchMD5(file);
        if (!md5) {
            console.log("导入失败")
            return resolve();
        } else {
            try {
                await handleBook(file, md5);
            } catch (error) {
                console.log(error);
            }
            return resolve();
        }
    });
};


onMounted(() => {
    testBook("/3.azw3")
})

</script>
<template>
    <div class="book">
        <!-- 弹出层 -->
        <div class="container">
            <el-dialog
                v-model="dialogFormVisible" title="导入书籍" width="500" draggable>
                <el-upload
                    class="upload-demo" drag action="#"
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
            <div class="booklist">
                <img :src="coverRef" style="width: 120px;height:180px;" />
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
</style>