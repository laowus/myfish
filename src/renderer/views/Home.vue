<script setup>
import { ref } from 'vue'

const showUpbtn = ref(false)

const handleChange = (uploadFile, uploadFiles) => {
    console.log(uploadFile, uploadFiles)
    showUpbtn.value = true
}

</script>

<template>
    <div class="book">
        <h3>
            我的书架
            <div class="tools">
                <el-upload
                    class="upload-demo"
                    drag
                    action="#"
                    :auto-upload="false"
                    :on-change="handleChange"
                    multiple>
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        拖拽这里或 <em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            格式: eupb/mobi/awz3
                        </div>
                    </template>
                </el-upload>
                <el-button class="ml-3" type="success" @click="" v-show="showUpbtn">
                    导入
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