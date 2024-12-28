<script setup>
import { ref } from 'vue'

const dialogFormVisible = ref(false);
let fileList = []
const getFiles = () => {
    console.log(fileList)
}
const handleChange = (file, uploadFiles) => {
    fileList = uploadFiles
}

const handleRemove = (file, uploadFiles) => {
    fileList = uploadFiles
}
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
    }

}
</style>