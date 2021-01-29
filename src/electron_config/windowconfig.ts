import { BrowserWindowConstructorOptions } from 'electron'


 export const mainWindowConfig: BrowserWindowConstructorOptions = {
        width: 1270,
        height: 720,
        resizable: true,
        transparent: true,
        fullscreenable: true,
        backgroundColor: '#abffffff',
        webPreferences: {
            contextIsolation: false
        }
}