<script setup>
import TitleBar from './components/TitleBar.vue';
import { useRouter } from 'vue-router';
const { ipcRenderer } = window.require('electron');
import logo from '../../public/images/alpha-logo.png';
import { onBeforeMount, onMounted } from 'vue';
import { useSettingStore } from './store/settingStore';
const fs = window.require("fs")
const path = window.require("path")
const router = useRouter()
const setting = useSettingStore()

let bookVisible = false

const initPath = () => {
  const dirPath = ipcRenderer.sendSync("user-data", "ping")
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
    fs.mkdirSync(path.join(dirPath, "data"))
    fs.mkdirSync(path.join(dirPath, "data", "book"))
    console.log("folder created")
  } else {
    console.log("folder exist")
  }

}

onBeforeMount(() => {
  initPath()
  if (router.path == '/read') {
    bookVisible = true
  }
})

onMounted(() => {

  // 监听更新数据消息
  ipcRenderer.on('update-data', (event, newData) => {
    console.log(newData);
    setting.updateAllData(newData)
  });

})
</script>

<template>
  <div id="app">
    <el-container>
      <el-aside class="left" v-if="!bookVisible">
        <div
          style="position: relative; top: 20px; text-align: center;
                   display: flex; justify-content: center; align-items: center;
                   flex-direction: column; color: #fff; font-family: sans-serif;
                     letter-spacing: 2px;">
          <el-image
            style="width: 30px; height: 30px"
            :src="logo"
            class="logo"></el-image>
        </div>
        <el-menu
          :default-active="$route.fullPath" router :collapse="true"
          style="margin-left: 10px; margin-top: 20px;" background-color="#1e222d">
          <el-menu-item index="/">
            <el-icon>
              <Notebook />
            </el-icon>
            <template #title>使用说明</template>
          </el-menu-item>
          <el-menu-item index="/book">
            <el-icon>
              <Shop />
            </el-icon>
            <template #title>我的书架</template>
          </el-menu-item>
          <el-menu-item index="/config">
            <el-icon>
              <Setting />
            </el-icon>
            <template #title>配置</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <TitleBar v-if="!bookVisible"></TitleBar>
      <el-container :style="{ marginTop: !bookVisible ? '10px' : '0' }">
        <el-main class="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss">
:root {
  --left-width: 30px !important;
  --top-height: 90px;
  --el-menu-base-level-padding: 4px !important;
  --el-menu-level-padding: 4px !important;
}

::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  -webkit-border-radius: 5px;
  border-radius: 5px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  opacity: 0.1;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.5);
}

body {
  margin: 0;
  width: 100%;
  position: fixed;
  overflow: hidden;
  overscroll-behavior-y: none;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    '微软雅黑', Arial, sans-serif;
  user-select: none;
}

.top {
  background-color: #1f2127;
  color: white;
  height: var(--top-height) !important;
}

.left {
  background-color: #1e222d;
  height: calc(100vh);
  /* width: var(--left-width) !important; */
  width: 54px !important;
  z-index: 11;

  .logo:hover {
    transform: scale(1.2);
    transition: all 0.3s;
    cursor: pointer;
  }
}

.main {
  background-color: #fefefe;
  color: #333;
  height: calc(100vh);
}

.el-menu {
  border: 0px !important;
  overflow-x: hidden;
}


.el-menu-item {
  border-radius: 20px;
  margin: 30px 2px;
  color: #999999 !important;
  width: 30px !important;
  height: 30px !important;
}

.el-menu-item:focus,
.el-menu-item:hover,
.el-submenu__title:focus,
.el-submenu__title:hover {
  background-color: #272f3f !important;
}

.el-menu-item.is-active {
  transition: all 1s;
  border-radius: 20px;
  background-color: #008aff !important;
  color: white !important;
}


.activeItem {
  color: rgb(255, 90, 90) !important;
}
</style>
