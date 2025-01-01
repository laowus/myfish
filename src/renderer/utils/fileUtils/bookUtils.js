
import { makeBook } from '../../libs/reader'

class BookUtil {
    static generateBook(bookName, extension, md5, size, path, file) {
        return new Promise(async (resolve, reject) => {
            try {
                let cover = ""
                let key, name, author, publisher, description, charset, page;
                [name, author, description, publisher, charset, page] = [
                    bookName,
                    "Unknown author",
                    "",
                    "",
                    "",
                    0
                ]
                let metadata
                let rendition = makeBook(file)
                console.log(rendition)
            } catch (error) {

            }
        });

    }
}
export default BookUtil