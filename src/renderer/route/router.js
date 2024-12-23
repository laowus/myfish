import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue'
import Book from '../views/Book.vue'
import Config from '../views/Config.vue'
import Read from '../views/Read.vue'


const routes = [
    { //默认
        path: '/',
        component: Home
    },
    {
        path: '/book',
        component: Book
    },
    {
        path: '/config',
        component: Config
    },
    {
        path: '/read',
        component: Read
    }
]

export const router = createRouter({
    //为了简单起见，在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes
})