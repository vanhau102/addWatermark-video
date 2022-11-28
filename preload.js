const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    addLogoToVideo: (data) => { ipcRenderer.invoke('addLogoToVideo', data) },
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    load: () => ipcRenderer.invoke('load'),
    getPathToFfmpeg: () => ipcRenderer.invoke('getPathToFfmpeg'),
    // we can also expose variables, not just functions
})