const { app, BrowserWindow, ipcMain, Menu, shell, Tray, } = require('electron')
const { isWinOS, isDevEnv, APP_ICON } = require('./env')
const fs = require('fs');
const path = require('path')
//C:\Users\magic\AppData\Roaming\myfish 
// windows下存储目录
const configDir = app.getPath("userData");
//C:\Users\magic\AppData\Roaming\myfish\uploads
const dirPath = path.join(configDir, "uploads");

let FOLDER_PATH = path.join(__dirname, '../../books');
let resourcesRoot = path.resolve(app.getAppPath());
let publicRoot = path.join(__dirname, '../../public')

if (!isDevEnv) {
    resourcesRoot = path.dirname(resourcesRoot);
    FOLDER_PATH = path.join(resourcesRoot, "/books")
    publicRoot = path.join(__dirname, '../../dist')
}

let mainWin = null, tray = null
const appWidth = 1024, appHeight = 768
/* 自定义函数 */
const startup = () => {
    init()
    registryGlobalListeners()
}

const init = () => {
    app.whenReady().then(() => {
        mainWin = createWindow()
    })

    app.on('activate', (event) => {
        if (BrowserWindow.getAllWindows().length === 0) {
            mainWin = createWindow()
        }
    })

    app.on('window-all-closed', (event) => {
        if (!isDevEnv) {
            app.quit()
        }
    })

    app.on('before-quit', (event) => {
        sendToRenderer('app-quit')
    })
}

ipcMain.on('window-min', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.hide();
});
ipcMain.on('window-max', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.maximize();
});
ipcMain.on('window-close', event => {
    const webContent = event.sender;
    const win = BrowserWindow.fromWebContents(webContent);
    win.hide();
});


//全局事件监听
const registryGlobalListeners = () => {
    //主进程事件监听
    ipcMain.on('app-quit', () => {
        app.quit()
    }).on('app-min', () => {
        if (mainWin.isFullScreen()) mainWin.setFullScreen(false)
        if (mainWin.isMaximized() || mainWin.isNormal()) mainWin.minimize()
    }).on('app-max', () => {
        let isFullScreen = false
        if (isWinOS) {
            isFullScreen = toggleWinOSFullScreen()
        } else {
            isFullScreen = !mainWin.isFullScreen()
            mainWin.setFullScreen(isFullScreen)
        }
        sendToRenderer('app-max', isFullScreen)
    }).on('app-zoom', (e, value) => {
        setAppWindowZoom(value)
    }).on('app-zoom-noResize', (e, value) => {
        setAppWindowZoom(value, true)
    })
}

//创建浏览窗口
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: appWidth,
        height: appHeight,
        minWidth: appWidth,
        minHeight: appHeight,
        show: false,
        frame: false,
        webPreferences: {
            // preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false  //TODO 有风险，暂时保留此方案，留待后期调整
        }
    })

    if (isDevEnv) {
        mainWindow.loadURL("http://localhost:7000/")
        // Open the DevTools.

    } else {
        // Load the index.html of the app.
        mainWindow.loadFile('dist/index.html')
    }
    mainWindow.webContents.openDevTools()

    tray = new Tray(path.join(publicRoot, '/images/logo.png'));
    tray.setToolTip('fish-book');
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '打开主界面',
            icon: path.join(publicRoot, '/images/app.png'),
            click: () => {
                mainWindow.show();
            },
        },
        {
            label: '退出',
            icon: path.join(publicRoot, '/images/quit.png'),
            click: function () {
                app.quit();
            },
        },
    ])
    tray.setContextMenu(contextMenu);
    //监听托盘双击事件
    tray.on('double-click', () => {
        mainWindow.show();
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    return mainWindow
}

const sendToRenderer = (channel, args) => {
    try {
        if (mainWin) mainWin.webContents.send(channel, args)
    } catch (error) {

    }
}

const toggleWinOSFullScreen = () => {
    if (!isWinOS) return null
    const isMax = mainWin.isMaximized()
    if (isMax) {
        mainWin.unmaximize()
    } else {
        mainWin.maximize()
    }
    return !isMax
}

const setAppWindowZoom = (value, noResize) => {
    const zoom = Number(value || 100)
    const zoomFactor = parseFloat(zoom / 100)
    const width = parseInt(appWidth * zoomFactor)
    const height = parseInt(appHeight * zoomFactor)
    mainWin.webContents.setZoomFactor(zoomFactor)
    if (noResize) return
    mainWin.setMinimumSize(width, height)
    if (mainWin.isNormal()) {
        mainWin.setSize(width, height)
        mainWin.center()
    }
}


// 监听从渲染进程发送的消息
ipcMain.on('readFiles', async (event, data) => {
    try {
        console.log("FOLDER_PATH", FOLDER_PATH)
        // 读取文件夹中所有文件
        const files = await fs.promises.readdir(FOLDER_PATH);
        // 过滤出txt文件
        const txtFiles = files.filter(file => path.extname(file) === '.txt');
        console.log("txtFiles", txtFiles);
        event.reply('fileContent', txtFiles);
    } catch (err) {
        event.reply('readFilesError', err);
    }
})
ipcMain.on("user-data", (event, arg) => {
    event.returnValue = dirPath;
})

const copyFile = (source, destination, callback) => {
    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(destination);
    readStream.on('error', (error) => callback(error, null));
    writeStream.on('error', (error) => callback(error, null));
    writeStream.on('close', () => callback(null, destination));
    readStream.pipe(writeStream);
}

ipcMain.on('addBooks', async (event, data) => {
    console.log(data)
    if (data.length > 1) {
        data.forEach(item => {
            const sourcePath = item.path;
            const destinationPath = path.join(FOLDER_PATH, item.name);
            copyFile(sourcePath, destinationPath, (error, destination) => {
                if (error) {
                    console.error(error);
                    return;
                }
                console.log(`文件复制成功: ${destination}`);
            });
        });
    }
})

ipcMain.on("storage-location", (event, arg) => {
    event.returnValue = path.join(dirPath, "data");//获取
});

ipcMain.handle('open-books-folder', async event => {
    // const filePath = path.join(__dirname, '../../books');
    // console.log(filePath)
    try {
        shell.openPath(FOLDER_PATH);
    } catch (error) {
        console.error(error);
        return null;
    }
});





//启动应用
startup()

