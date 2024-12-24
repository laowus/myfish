<script setup>
import TitleBar from './components/TitleBar.vue';
import { useRouter } from 'vue-router';
import { useIpcRenderer } from '../common/Utils';
import logo from '../../public/images/alpha-logo.png';
import { onBeforeMount, onMounted } from 'vue';
import { useSysStore } from './store/sysStore';

const router = useRouter()
const ipcRenderer = useIpcRenderer()
const sys = useSysStore()

let bookVisible = false
onBeforeMount(() => {
  if (router.path == '/read') {
    bookVisible = true
  }
})
onMounted(() => {
  // 监听更新数据消息
  ipcRenderer.on('update-data', (event, newData) => {
    console.log(newData);
    sys.updateAllData(newData)
  });
})
</script>

<template>
  <div id="app">
    <el-container>
      <el-container>
        <el-aside class="left" v-if="!bookVisible">
          <div style="position: relative; top: 20px;text-align: center;
                      display: flex;justify-content: center;align-items: center;
                      flex-direction: column; color: #fff;font-family: sans-serif;
                      letter-spacing: 2px;">
            <el-image
              style="width: 40px; height: 40px"
              :src="logo"
              class="logo"></el-image>
          </div>
          <el-menu
            :default-active="$route.fullPath" router :collapse="true"
            style="margin-left: 18px; margin-top: 50px" background-color="#1e222d">
            <el-menu-item index="/">
              <el-icon>
                <Notebook />
              </el-icon>
              <span slot="title">使用说明</span>
            </el-menu-item>
            <el-menu-item index="/book">
              <el-icon>
                <Shop />
              </el-icon>
              <span slot="title">我的书架</span>
            </el-menu-item>
            <el-menu-item index="/config">
              <el-icon>
                <Setting />
              </el-icon>
              <span slot="title">配置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <TitleBar v-if="!bookVisible"></TitleBar>
        <el-container :style="{ marginTop: !bookVisible ? '40px' : '0' }">
          <el-main class="main">
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<style lang="scss">
:root {
  --left-width: 30px !important;
  --top-height: 90px;
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
  background-color: #272f3f;
  color: white;
  height: var(--top-height) !important;
}

.left {
  background-color: #1e222d;
  height: calc(100vh);
  /* width: var(--left-width) !important; */
  width: 100px !important;

  .logo:hover {
    transform: scale(1.2);
    transition: all 0.3s;
    cursor: pointer;
  }
}

.main {
  /* background-color: #fefefe; */
  color: #333;
  height: calc(100vh);
}

.el-menu {
  border: 0px !important;
  overflow-x: hidden;
}

.el-menu-item {
  border-radius: 10px;
  margin: 20px 0;
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

.episodeCell {
  min-width: var(--left-width) !important;
  padding: 5px 5px 5px 30px !important;
}

.episodeCellParagraph {
  line-height: 15px !important;
  font-size: 15px !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activeItem {
  color: rgb(255, 90, 90) !important;
}

.previewLine1 {
  text-align: center;
  color: snow;
  font-size: 15px;
  text-overflow: ellipsis;
  height: 25px;
}

.previewLine2 {
  text-align: center;
  color: lightgray;
  font-size: 15px;
  text-overflow: ellipsis;
  height: 25px;
}
</style>
