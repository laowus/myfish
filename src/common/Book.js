import { toMMssSSS } from 'timers'

export class Book {
    constructor(title, author) {
        this.bid = Date().getTime() //时间戳作为唯一id号
        this.title = title//书名
        this.author = author//作者
        this.cateId = 0 //分类
        this.addTime = Date.now()//添加时间
        this.lastRead = 0 // 上次阅读时间
    }

    lastReadTmss() {
        return this.lastReadTmss(this)
    }

    static lastReadTmss(book) {
        return book.lastRead ? "未读" : toMMssSSS(book.lastRead)
    }

    addTimeTmss() {
        return this.addTimeTmss(this)
    }

    static addTimeTmss(book) {
        return toMMssSSS(book.addTime)
    }
    // 改变分类
    changeCateId(cateId) {
        this.cateId = cateId
    }
}