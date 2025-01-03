
import { makeBook } from '../../libs/reader'
import Book from '../../models/Book';

class BookUtil {
    static addBook(key, buffer) {
        const fs = window.require("fs");
        const path = window.require("path");
        const dataPath = localStorage.getItem("storageLocation")
            ? localStorage.getItem("storageLocation")
            : window.require("electron")
                .ipcRenderer.sendSync("storage-location", "ping");
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsArrayBuffer(new Blob([buffer]));
            reader.onload = async (event) => {
                if (!event.target) return;
                try {
                    if (!fs.existsSync(path.join(dataPath, "book"))) {
                        fs.mkdirSync(path.join(dataPath, "book"));
                    }
                    fs.writeFileSync(
                        path.join(dataPath, "book", key),
                        Buffer.from(event.target.result)
                    );
                    resolve();
                } catch (error) {
                    reject();
                    throw error;
                }
            }
            reader.onerror = () => {
                reject();
            };
        })
    }

    static generateBook(bookName, extension, md5, size, path, file) {
        return new Promise(async (resolve, reject) => {
            try {
                let cover = "";
                let key, name, author, publisher, description, charset, page;
                [name, author, description, publisher, charset, page] = [
                    bookName, "Unknown author", "", "", "", 0];
                let meta;
                const book = await makeBook(file);
                meta = book.metadata;
                [name, author, description, publisher, cover] = [
                    meta.title || bookName, meta.author || "Unknown author",
                    meta.description || "", meta.publisher || "", meta.cover || ""
                ];
                let format = extension.toUpperCase();
                key = new Date().getTime() + "";
                resolve(
                    new Book(key, name, author, description, md5, cover,
                        format, publisher, size, page, path, charset)
                );
            } catch (error) {
                console.log(error);
                resolve("get_metadata_error");
            }
        });

    }
}

export default BookUtil