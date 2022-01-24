function parseMenu() {
    const menu = new WeakSet();
    return (key, value) => {
        if (key === 'commandsMap') return;
        if (typeof value === 'object' && value !== null) {
            if (menu.has(value)) return;
            menu.add(value);
        }
        return value;
    };
}

function getMenuItemByCommandId(commandId, menu) {
    let menuItem;
    menu.items.forEach(item => {
        if (item.submenu) {
            const submenuItem = getMenuItemByCommandId(commandId, item.submenu);
            if (submenuItem) menuItem = submenuItem;
        }
        if (item.commandId === commandId) menuItem = item;
    });

    return menuItem;
}

module.exports = { parseMenu, getMenuItemByCommandId }