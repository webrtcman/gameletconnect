import { BrowserWindowConstructorOptions } from 'electron'


 export const mainWindowConfig: BrowserWindowConstructorOptions = {
        width: 1600,
        height: 900,
        resizable: true,
        fullscreenable: true,
        //frame: false,
        //transparent: true,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            //devTools: false
            
        }
}