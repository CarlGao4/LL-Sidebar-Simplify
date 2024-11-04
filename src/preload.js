// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");


// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("sidebar_simplify", {
    // 框架中 IPC 通信标识格式为 "组织名.项目名.方法名"
    // 格式不重要，只需要确保标识唯一即可，定义成什么都行
    getUpperToggles: () => ipcRenderer.invoke("sidebar_simplify.getUpperToggles"),
    getLowerToggles: () => ipcRenderer.invoke("sidebar_simplify.getLowerToggles"),
    isUpperVisible: (label) => ipcRenderer.invoke("sidebar_simplify.isUpperVisible", label),
    isLowerVisible: (label) => ipcRenderer.invoke("sidebar_simplify.isLowerVisible", label),
    toggleUpper: (label, status) => ipcRenderer.invoke("sidebar_simplify.toggleUpper", label, status),
    toggleLower: (label, status) => ipcRenderer.invoke("sidebar_simplify.toggleLower", label, status),
    getConfig: () => ipcRenderer.invoke("sidebar_simplify.getConfig"),
    setConfig: (config) => ipcRenderer.invoke("sidebar_simplify.setConfig", config),
});
