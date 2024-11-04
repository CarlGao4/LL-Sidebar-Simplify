// 运行在 Electron 渲染进程 下的页面脚本
const { getUpperToggles, getLowerToggles, toggleUpper, toggleLower, isUpperVisible, isLowerVisible, getConfig, setConfig } = window.sidebar_simplify

/**
 * 切换开关状态
 * @param {HTMLElement} el
 */
const toggleSwitch = (el) => el.toggleAttribute('is-active')

/**
 * 判断开关状态
 * @param {HTMLElement} el
 */
const isSwitchChecked = (el) => el.hasAttribute('is-active')

/**
 * 设置开关状态
 * @param {HTMLElement} el
 * @param {Boolean} checked
 */
const setSwitchChecked = (el, checked) => checked ? el.setAttribute('is-active', '') : el.removeAttribute('is-active')

/**
 * 
 * @param {Element} view 
 */

// 打开设置界面时触发
export const onSettingWindowCreated = async (view) => {
    // view 为 Element 对象，修改将同步到插件设置界面
    var settingsHTML = '<setting-section data-title="边栏上部组件" id="upper-toggles"><setting-panel><setting-list data-direction="column">';
    const upper_toggles = await getUpperToggles();
    upper_toggles.forEach((toggle) => {
        settingsHTML += `<setting-item><setting-text>${toggle[0]}</setting-text><setting-switch ${toggle[1] ? "is-active" : ""}/></setting-item>`;
    });
    settingsHTML += '</setting-list></setting-panel></setting-section>';
    settingsHTML += '<setting-section data-title="边栏下部组件" id="lower-toggles"><setting-panel><setting-list data-direction="column">';
    const lower_toggles = await getLowerToggles();
    lower_toggles.forEach((toggle) => {
        settingsHTML += `<setting-item><setting-text>${toggle[0]}</setting-text><setting-switch ${toggle[1] ? "is-active" : ""}/></setting-item>`;
    });
    view.insertAdjacentHTML("beforeend", settingsHTML);
    view.querySelectorAll("#upper-toggles setting-switch").forEach((el) => {
        el.addEventListener("click", async () => {
            toggleSwitch(el);
            await toggleUpper(el.previousElementSibling.innerText, isSwitchChecked(el));
            var config = await getConfig();
            if (!config.upper) config.upper = {};
            config.upper[el.previousElementSibling.innerText] = isSwitchChecked(el);
            await setConfig(config);
            setTimeout(async () => setSwitchChecked(el, await isUpperVisible(el.previousElementSibling.innerText)), 1000);
        });
    });
    view.querySelectorAll("#lower-toggles setting-switch").forEach((el) => {
        el.addEventListener("click", async () => {
            toggleSwitch(el);
            await toggleLower(el.previousElementSibling.innerText, isSwitchChecked(el));
            var config = await getConfig();
            if (!config.lower) config.lower = {};
            config.lower[el.previousElementSibling.innerText] = isSwitchChecked(el);
            await setConfig(config);
            setTimeout(async () => setSwitchChecked(el, await isLowerVisible(el.previousElementSibling.innerText)), 1000);
        });
    });
}


// // Vue组件挂载时触发
// export const onVueComponentMount = (component) => {
//     // component 为 Vue Component 对象
// }


// // Vue组件卸载时触发
// export const onVueComponentUnmount = (component) => {
//     // component 为 Vue Component 对象
// }