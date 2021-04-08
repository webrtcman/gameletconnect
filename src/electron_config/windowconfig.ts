import { BrowserWindowConstructorOptions } from 'electron'
const path = require('path');
 export const mainWindowConfig: BrowserWindowConstructorOptions = {
        width: 1600,
        height: 900,
        resizable: true,
        fullscreenable: true,
        show: false,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            // webSecurity: false,
            //devTools: false
        }
        //frame: false,
        //transparent: true,
}