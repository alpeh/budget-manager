const { app, BrowserWindow } = require('electron')
const path = require('path')
const url =  require('url')
const isDevelopment = true;

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, '../js/preload.js'),
        },
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, '../html/index.html'),
            protocol: 'file:',
            slashes: true
        })
    );
    
    if(isDevelopment) {
        mainWindow.webContents.openDevTools();
    }
});