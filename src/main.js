// 运行在 Electron 主进程 下的插件入口
const { plugin: pluginPath, data: dataPath } = LiteLoader.plugins.sidebar_simplify.path
const { ipcMain, BrowserWindow } = require('electron')
const fs = require('fs')
const path = require('path')

const writeConfig = (config) => {
    const configPath = path.join(dataPath, 'config.json')
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true })
    }
    fs.writeFileSync(configPath, JSON.stringify(config))
    console.log("CONFIG WRITTEN", configPath, config)
}

const readConfig = () => {
    const configPath = path.join(dataPath, 'config.json')
    if (!fs.existsSync(configPath)) {
        writeConfig({})
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    console.log("CONFIG READ", configPath, config)
    return config
}

const toggleUpper = async (label, status) => {
    const windows = BrowserWindow.getAllWindows();
    try {
        for (const window of windows) {
            await window.webContents.executeJavaScript(`
                try {
                    const el = Array.from(document.querySelectorAll('.sidebar__upper .nav-item[aria-label]'))
                        .find(el => el.getAttribute('aria-label') === "${label}");
                    if (el) { el.style.display = ${status ? '""' : '"none"'} };
                } catch(e) { console.error(e) }
            `);
        }
    } catch (e) { console.error(e) }
}

const toggleLower = async (label, status) => {
    const windows = BrowserWindow.getAllWindows();
    try {
        for (const window of windows) {
            await window.webContents.executeJavaScript(`
                try {
                    const el = Array.from(document.querySelectorAll('.sidebar__lower .func-menu__item_wrap:has(*[aria-label])'))
                        .find(el => el.querySelector('*[aria-label]').getAttribute('aria-label') === "${label}");
                   if (el) { el.style.display = ${status ? '""' : '"none"'} };
                } catch(e) { console.error(e) }
            `);
        }
    } catch (e) { console.error(e) }
}

const tryToggleFromConfig = async () => {
    console.log("sidebar_simplify tryToggleFromConfig");
    const config = await readConfig()
    if (config && config.upper) {
        Object.keys(config.upper).forEach(async (key) => { await toggleUpper(key, config.upper[key]) });
    }
    if (config && config.lower) {
        Object.keys(config.lower).forEach(async (key) => { await toggleLower(key, config.lower[key]) });
    }
}

/**
 * 创建窗口时触发
 * @param {BrowserWindow} window - 创建的窗口
 */
exports.onBrowserWindowCreated = (window) => {
    // window 为 Electron 的 BrowserWindow 实例
    window.webContents.on('did-finish-load', tryToggleFromConfig);
    window.webContents.on('before-input-event', async (event, input) => {
        // Ctrl + Shift + R to reset config
        if (input.key === 'R' && (process.platform === 'darwin' ? input.meta : input.control) && input.shift && !input.alt && !input.isAutoRepeat && input.type === 'keyUp') {
            writeConfig({});
            const windows = BrowserWindow.getAllWindows();
            for (const window of windows) {
                window.webContents.executeJavaScript(`
                    Array.from(document.querySelectorAll('.sidebar__upper .nav-item[aria-label]')).forEach(el => el.style.display = "");
                    Array.from(document.querySelectorAll('.sidebar__lower .func-menu__item_wrap:has(*[aria-label])')).forEach(el => el.style.display = "");
                `);
            }
        }
    });
    window.on('focus', tryToggleFromConfig);
}

// 用户登录时触发
exports.onLogin = async (uid) => {
    // uid 为 账号 的 字符串 标识
}

ipcMain.handle('sidebar_simplify.setConfig', (_, config) => writeConfig(config))

ipcMain.handle('sidebar_simplify.getConfig', () => readConfig())

ipcMain.handle('sidebar_simplify.getUpperToggles', async () => {
    var toggles = [];
    const windows = BrowserWindow.getAllWindows();

    try {
        for (const window of windows) {
            const result = await window.webContents.executeJavaScript(`
                try {
                    const isElementVisible = (el) => Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
                    Array.from(document.querySelectorAll('.sidebar__upper .nav-item[aria-label]'))
                        .map(el => [el.getAttribute('aria-label'), isElementVisible(el)]);
                } catch(e) { console.error(e) }
            `);
            result.forEach(toggle => toggles.push(toggle));
        }
    } catch (e) { console.error(e) }
    console.log("TOGGLES", toggles);

    return toggles;
});

ipcMain.handle('sidebar_simplify.getLowerToggles', async () => {
    var toggles = [];
    const windows = BrowserWindow.getAllWindows();

    try {
        for (const window of windows) {
            const result = await window.webContents.executeJavaScript(`
                try {
                    const isElementVisible = (el) => Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
                    Array.from(document.querySelectorAll('.sidebar__lower .func-menu__item_wrap:has(*[aria-label])'))
                        .map(el => [el.querySelector('*[aria-label]').getAttribute('aria-label'), isElementVisible(el)]);
                } catch(e) { console.error(e) }
            `);
            result.forEach(toggle => toggles.push(toggle));
        }
    } catch (e) { console.error(e) }
    console.log("TOGGLES", toggles);
    return toggles;
});

ipcMain.handle('sidebar_simplify.isUpperVisible', async (_, label) => {
    const windows = BrowserWindow.getAllWindows();
    try {
        for (const window of windows) {
            const result = await window.webContents.executeJavaScript(`
                try {
                    const isElementVisible = (el) => Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
                    const el = Array.from(document.querySelectorAll('.sidebar__upper .nav-item[aria-label]')).find(el => el.getAttribute("aria-label") === "${label}");
                    if (el) isElementVisible(el);
                } catch(e) { console.log(e) }
            `);
            if (result) return result;
        }
        return false;
    } catch (e) { console.log(e) }
});

ipcMain.handle('sidebar_simplify.isLowerVisible', async (_, label) => {
    const windows = BrowserWindow.getAllWindows();
    try {
        for (const window of windows) {
            const result = await window.webContents.executeJavaScript(`
                try {
                    const isElementVisible = (el) => Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
                    const el = Array.from(document.querySelectorAll('.sidebar__lower .func-menu__item_wrap:has(*[aria-label])')).find(el => el.querySelector('*[aria-label]').getAttribute("aria-label") === "${label}");
                    if (el) isElementVisible(el)
                } catch(e) { console.log(e) }
            `);
            if (result) return result;
        }
        return false;
    } catch (e) { console.log(e) }
});

ipcMain.handle('sidebar_simplify.toggleUpper', async (_, label, status) => toggleUpper(label, status));

ipcMain.handle('sidebar_simplify.toggleLower', async (_, label, status) => toggleLower(label, status));
