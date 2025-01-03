// main.js 或者 main.ts
import { createApp } from 'vue'
import App from './App.vue'
//Pinia
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist'
//Router
import { router } from './route/router';
//LazyLoad
import VueLazyLoad from 'vue3-lazyload';
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import ImageTextTile from './components/ImageTextTile.vue';


//状态管理
const pinia = createPinia()
pinia.use(piniaPersist)

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
//全局异常处理器
app.config.errorHandler = (err, vm, info) => {
    // 处理错误
    console.log(err)
}

app.use(pinia)
    .use(router)
    .use(VueLazyLoad, {
        loading: 'default_cover.png',
        error: 'default_cover.png'
    }).use(ElementPlus)
    .component('ImageTextTile', ImageTextTile)
    .mount('#app')