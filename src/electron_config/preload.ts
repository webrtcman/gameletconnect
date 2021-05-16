import { contextBridge, ipcRenderer, desktopCapturer, NativeImage, DesktopCapturerSource } from "electron";

let desktopCapturerSource : DesktopCapturerSource

contextBridge.exposeInMainWorld('connectApi', {
    ipc: {
        send: (event_name, payload) => ipcRenderer.send(event_name, payload),
        on: (event_name, callback) => ipcRenderer.on(event_name, callback),
        once: (event_name, callback) => ipcRenderer.once(event_name, callback),
        removeListener: (event_name, callback) => ipcRenderer.removeListener(event_name, callback)
    },
    desktopCapturer,
    NativeImage,
    desktopCapturerSource 
})