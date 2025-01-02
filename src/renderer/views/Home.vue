<script setup>
import localforage from 'localforage';
import { ref, onMounted } from 'vue'
import { fetchMD5 } from '../utils/fileUtils/md5Util'
import BookUtil from '../utils/fileUtils/bookUtils'
import { ElMessage } from 'element-plus';
import { Message } from '../../common/resetMessage';

const dialogFormVisible = ref(false);
let fileList = []
let bookArr = []
let clickFilePath = "";
const getFiles = () => {
    if (fileList.length > 0) {
        fileList.map(
            async (file) => {
                // 解析文件 文件名 后缀 
                await getMd5WithBrowser(file.raw)
            }
        )
    }
}

const getMd5WithBrowser = async (file) => {
    return new Promise(async (resolve, reject) => {
        const md5 = await fetchMD5(file) //md5设置
        if (!md5) {
            ElMessage({
                message: '导入失败',
                type: 'error',
                plain: true,
            })
            return resolve()
        } else {
            try {
                await handleBook(file, md5)
            } catch (error) {
                console.log(error)
            }
            return resolve()
        }
    })
}
//文件信息 
const handleBook = (file, md5) => {
    //获取文件后缀
    let extension = (file.name)
        .split(".")
        .reverse()[0]
        .toLocaleLowerCase()
    //获取文件名字xxx 如xxx.epub
    let bookName = file.name.substr(
        0,
        file.name.length - extension.length - 1
    )
    let result
    return new Promise((resolve, reject) => {
        let isRepeat = false;
        //判断是否重复
        if (bookArr.length > 0) {
            bookArr.forEach((item) => {
                if (item.md5 === md5 && item.size === file.size) {
                    isRepeat = true;
                    Message.warning('重复书籍');
                    return resolve();
                }
            })
        }
        if (!isRepeat) {
            let reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = async (e) => {
                if (!e.target) {
                    ElMessage({
                        message: '导入失败',
                        type: 'error',
                        plain: true,
                    })
                    return resolve()
                }
                let reader = new FileReader()
                reader.onload = async (event) => {
                    const file_content = event.target.result
                    try {
                        result = await BookUtil.generateBook(
                            bookName,
                            extension,
                            md5,
                            file.size,
                            file.path || clickFilePath,
                            file
                        )
                    } catch (error) {
                        console.log(error)
                        throw error
                    }
                    clickFilePath = ""
                    if (result === "get_metadata_error") {
                        ElMessage({
                            message: '导入失败',
                            type: 'error',
                            plain: true,
                        })
                        return resolve()
                    }
                    //把文件复制
                    await handleAddBook(
                        result,
                        file_content
                    )
                    return resolve()
                }
                reader.readAsArrayBuffer(file)
            }
        }
    })
}

const handleAddBook = (book, buffer) => {
    return new Promise((resolve, reject) => {
        BookUtil.addBook(book.key, buffer);
        bookArr.push(book);
        localforage.setItem("books", bookArr).then(() => {
            ElMessage({
                message: '导入成功' + book.name,
                type: 'success',
                plain: true,
            })
            return resolve();
        }).catch(() => {
            ElMessage({
                message: '导入失败' + book.name,
                type: 'error',
                plain: true,
            })
            return resolve();
        });
    })
}

const handleChange = (file, uploadFiles) => {
    fileList = uploadFiles
}

const handleRemove = (file, uploadFiles) => {
    fileList = uploadFiles
}

onMounted(() => {
    localforage.getItem("books").then((value) => {
        bookArr = value ? value : []
        console.log("bookArr", bookArr)
    });
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