/*--------------------------------------------------------------------------------------------------------
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 * 
 *  This file has parts of one or more project files (VS Code) from Microsoft
 *  You can check your respective license and the original file in https://github.com/Microsoft/vscode/
 *-------------------------------------------------------------------------------------------------------*/

import { toDisposable, IDisposable, Disposable } from "./common/lifecycle";

class ThemingRegistry extends Disposable {
    private theming: Theme[] = [];

    constructor() {
        super();

        this.theming = [];
    }

    protected onThemeChange(theme: Theme): IDisposable {
        this.theming.push(theme);
        return toDisposable(() => {
            const idx = this.theming.indexOf(theme);
            this.theming.splice(idx, 1);
        });
    }

    protected getTheming(): Theme[] {
        return this.theming;
    }
}

export class Themebar extends ThemingRegistry {

    constructor() {
        super();

        // Titlebar
        this.registerTheme((collector: CssStyle) => {
            collector.addRule(`
            .titlebar {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                box-sizing: border-box;
                width: 100%;
                font-size: 13px;
                padding: 0 16px;
                overflow: hidden;
                flex-shrink: 0;
                align-items: center;
                justify-content: center;
                user-select: none;
                zoom: 1;
                line-height: 22px;
                height: 22px;
                display: flex;
                z-index: 99999;
            }
        
            .titlebar.windows, .titlebar.linux {
                padding: 0;
                height: 30px;
                line-height: 30px;
                justify-content: left;
                overflow: visible;
            }
        
            .titlebar.inverted, .titlebar.inverted .menubar,
            .titlebar.inverted .window-controls-container {
                flex-direction: row-reverse;
            }
        
            .titlebar.inverted .window-controls-container {
                margin: 0 5px 0 0;
            }
        
            .titlebar.first-buttons .window-controls-container {
                order: -1;
                margin: 0 5px 0 0;
            }
            `);
        });

        // Drag region
        this.registerTheme((collector: CssStyle) => {
            collector.addRule(`
            .titlebar .titlebar-drag-region {
                top: 0;
                left: 0;
                display: block;
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: -1;
                -webkit-app-region: drag;
            }
            `);
        });

        // icon app
        this.registerTheme((collector: CssStyle) => {
            collector.addRule(`
            .titlebar > .window-appicon {
                width: 35px;
                height: 30px;
                position: relative;
                z-index: 99;
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 16px;
                flex-shrink: 0;
            }
            `);
        });

        // Menubar
        this.registerTheme((collector: CssStyle) => {
            collector.addRule(`
            .menubar {
                display: flex;
                flex-shrink: 1;
                box-sizing: border-box;
                height: 30px;
                overflow: hidden;
                flex-wrap: wrap;
            }
        
            .menubar.bottom {
                order: 1;
                width: 100%;
                padding: 0 5px;
            }
            
            .menubar .menubar-menu-button {
                align-items: center;
                box-sizing: border-box;
                padding: 0px 8px;
                cursor: default;
                -webkit-app-region: no-drag;
                zoom: 1;
                white-space: nowrap;
                outline: 0;
            }

            .menubar .menubar-menu-button.disabled {
                opacity: 0.4;
            }

            .menubar .menubar-menu-button:not(.disabled):focus,
			.menubar .menubar-menu-button:not(.disabled).open,
			.menubar .menubar-menu-button:not(.disabled):hover {
				background-color: rgba(255, 255, 255, .1);
			}
	
			.titlebar.light .menubar .menubar-menu-button:focus,
			.titlebar.light .menubar .menubar-menu-button.open,
			.titlebar.light .menubar .menubar-menu-button:hover {
				background-color: rgba(0, 0, 0, .1);
			}
        
            .menubar-menu-container {
                position: absolute;
                display: block;
                left: 0px;
                opacity: 1;
                outline: 0;
                border: none;
                text-align: left;
                margin: 0 auto;
                padding: .5em 0;
                margin-left: 0;
                overflow: visible;
                justify-content: flex-end;
                white-space: nowrap;
                box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);
                z-index: 99999;
            }
            
            .menubar-menu-container:focus {
                outline: 0;
            }
            
            .menubar-menu-container .action-item {
                padding: 0;
                transform: none;
                display: -ms-flexbox;
                display: flex;
                outline: none;
            }
            
            .menubar-menu-container .action-item.active {
                transform: none;
            }
            
            .menubar-menu-container .action-menu-item {
                -ms-flex: 1 1 auto;
                flex: 1 1 auto;
                display: -ms-flexbox;
                display: flex;
                height: 2.5em;
                align-items: center;
                position: relative;
            }
            
            .menubar-menu-container .action-label {
                -ms-flex: 1 1 auto;
                flex: 1 1 auto;
                text-decoration: none;
                padding: 0 1em;
                background: none;
                font-size: 12px;
                line-height: 1;
            }
        
            .menubar-menu-container .action-label:not(.separator),
            .menubar-menu-container .keybinding {
                padding: 0 2em 0 1em;
            }
            
            .menubar-menu-container .keybinding,
            .menubar-menu-container .submenu-indicator {
                display: inline-block;
                -ms-flex: 2 1 auto;
                flex: 2 1 auto;
                padding: 0 2em 0 1em;
                text-align: right;
                font-size: 12px;
                line-height: 1;
            }
            
            .menubar-menu-container .submenu-indicator {
                height: 100%;
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.52 12.364L9.879 7 4.52 1.636l.615-.615L11.122 7l-5.986 5.98-.615-.616z' fill='%23000'/%3E%3C/svg%3E") no-repeat right center/13px 13px;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.52 12.364L9.879 7 4.52 1.636l.615-.615L11.122 7l-5.986 5.98-.615-.616z' fill='%23000'/%3E%3C/svg%3E") no-repeat right center/13px 13px;
                font-size: 60%;
                margin: 0 2em 0 1em;
            }
            
            .menubar-menu-container .action-item.disabled .action-menu-item,
            .menubar-menu-container .action-label.separator {
                opacity: 0.4;
            }
            
            .menubar-menu-container .action-label:not(.separator) {
                display: inline-block;
                -webkit-box-sizing: border-box;
                -o-box-sizing: border-box;
                -moz-box-sizing: border-box;
                -ms-box-sizing:	border-box;
                box-sizing:	border-box;
                margin: 0;
            }
            
            .menubar-menu-container .action-item .submenu {
                position: absolute;
            }
            
            .menubar-menu-container .action-label.separator {
                font-size: inherit;
                padding: .2em 0 0;
                margin-left: .8em;
                margin-right: .8em;
                margin-bottom: .2em;
                width: 100%;
                border-bottom: 1px solid transparent;
            }
            
            .menubar-menu-container .action-label.separator.text {
                padding: 0.7em 1em 0.1em 1em;
                font-weight: bold;
                opacity: 1;
            }
            
            .menubar-menu-container .action-label:hover {
                color: inherit;
            }
            
            .menubar-menu-container .menu-item-check {
                position: absolute;
                visibility: hidden;
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='-2 -2 16 16'%3E%3Cpath fill='%23424242' d='M9 0L4.5 9 3 6H0l3 6h3l6-12z'/%3E%3C/svg%3E") no-repeat 50% 56%/15px 15px;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='-2 -2 16 16'%3E%3Cpath fill='%23424242' d='M9 0L4.5 9 3 6H0l3 6h3l6-12z'/%3E%3C/svg%3E") no-repeat 50% 56%/15px 15px;
                width: 2em;
                height: 2em;
                margin: 0 0 0 0.7em;
            }

            .menubar-menu-container .menu-item-icon {
                width: 18px;
                height: 18px;
                margin: 0 0 0 1.1em;
            }

            .menubar-menu-container .menu-item-icon img {
                display: inherit;
                width: 100%;
                height: 100%;
            }
            
            .menubar-menu-container .action-menu-item.checked .menu-item-icon {
                visibility: hidden;
            }

            .menubar-menu-container .action-menu-item.checked .menu-item-check {
                visibility: visible;
            }
            `);
        });

        // Title
        this.registerTheme((collector: CssStyle) => {
            collector.addRule(`
            .titlebar .window-title {
                flex: 0 1 auto;
                font-size: 12px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                margin: 0 auto;
                zoom: 1;
            }
            `);
        });

        // Window controls
        this.registerTheme((collector: CssStyle) => {
            collector.addRule(`
            .titlebar .window-controls-container {
                display: flex;
                flex-grow: 0;
                flex-shrink: 0;
                text-align: center;
                position: relative;
                z-index: 99;
                -webkit-app-region: no-drag;
                height: 30px;
                margin-left: 5px;
            }
            `);
        });

        // Resizer
        this.registerTheme((collector: CssStyle) => {
            collector.addRule(`
            .titlebar.windows .resizer, .titlebar.linux .resizer {
                -webkit-app-region: no-drag;
                position: absolute;
            }
        
            .titlebar.windows .resizer.top, .titlebar.linux .resizer.top {
                top: 0;
                width: 100%;
                height: 6px;
            }
        
            .titlebar.windows .resizer.left, .titlebar.linux .resizer.left {
                top: 0;
                left: 0;
                width: 6px;
                height: 100%;
            }
            `);
        });
    }

    protected registerTheme(theme: Theme) {
        this.onThemeChange(theme);

        let cssRules: string[] = [];
        let hasRule: { [rule: string]: boolean } = {};
        let ruleCollector = {
            addRule: (rule: string) => {
                if (!hasRule[rule]) {
                    cssRules.push(rule);
                    hasRule[rule] = true;
                }
            }
        };

        this.getTheming().forEach(p => p(ruleCollector));

        _applyRules(cssRules.join('\n'), 'titlebar-style');
    }

    static get win(): Theme {
        return ((collector: CssStyle) => {
            collector.addRule(`
            .titlebar .window-controls-container .window-icon-bg {
                display: inline-block;
                -webkit-app-region: no-drag;
                height: 100%;
                width: 46px;
            }
            
            .titlebar .window-controls-container .window-icon-bg .window-icon {
                height: 100%;
                width: 100%;
                -webkit-mask-size: 23.1% !important;
                mask-size: 23.1% !important;
            }
            
            .titlebar .window-controls-container .window-icon-bg .window-icon.window-close {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
            }
            
            .titlebar .window-controls-container .window-icon-bg .window-icon.window-close:hover {
                background-color: #ffffff!important;
            }
            
            .titlebar .window-controls-container .window-icon-bg .window-icon.window-unmaximize {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
            }
            
            .titlebar .window-controls-container .window-icon-bg .window-icon.window-maximize {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
            }
            
            .titlebar .window-controls-container .window-icon-bg .window-icon.window-minimize {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
            }
            
            .titlebar .window-controls-container .window-icon-bg.window-close-bg:hover {
                background-color: rgba(232, 17, 35, 0.9)!important;
            }
            
            .titlebar .window-controls-container .window-icon-bg.inactive {
                background-color: transparent!important;
            }

            .titlebar .window-controls-container .window-icon-bg.inactive .window-icon {
                opacity: .4;
            }
            
            .titlebar .window-controls-container .window-icon {
                background-color: #eeeeee;
            }

            .titlebar.light .window-controls-container .window-icon {
                background-color: #333333;
            }

            .titlebar.inactive .window-controls-container .window-icon {
                opacity: .7;
            }

            .titlebar .window-controls-container .window-icon-bg:not(.inactive):hover {
                background-color: rgba(255, 255, 255, .1);
            }

            .titlebar.light .window-controls-container .window-icon-bg:not(.inactive):hover {
                background-color: rgba(0, 0, 0, .1);
            }
        `);
        });
    }

    static get mac(): Theme {
        return ((collector: CssStyle) => {
            collector.addRule(`
            .titlebar .window-controls-container .window-icon-bg {
                display: inline-block;
                -webkit-app-region: no-drag;
                height: 15px;
                width: 15px;
                margin: 7.5px 6px;
                border-radius: 50%;
                overflow: hidden;
            }
            
            .titlebar .window-controls-container .window-icon-bg.inactive {
                background-color: #cdcdcd;
            }
            
            .titlebar .window-controls-container .window-icon-bg:nth-child(2n) {
                order: -1;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-icon {
                height: 100%;
                width: 100%;
                background-color: transparent;
                -webkit-mask-size: 100% !important;
                mask-size: 100% !important;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-icon:hover {
                background-color: rgba(0, 0, 0, 0.4);
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive):first-child {
                background-color: #febc28;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive):first-child:hover {
                background-color: #feb30a;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive):nth-child(2n) {
                background-color: #01cc4e;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive):nth-child(2n):hover {
                background-color: #01ae42;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg {
                background-color: #ff5b5d;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg:hover {
                background-color: #ff3c3f;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg .window-close {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-maximize {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                transform: rotate(-45deg);
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-unmaximize {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.41,7.41L10,12L5.41,16.59L4,15.17L7.17,12L4,8.83L5.41,7.41M18.59,16.59L14,12L18.59,7.42L20,8.83L16.83,12L20,15.17L18.59,16.59Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.41,7.41L10,12L5.41,16.59L4,15.17L7.17,12L4,8.83L5.41,7.41M18.59,16.59L14,12L18.59,7.42L20,8.83L16.83,12L20,15.17L18.59,16.59Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                transform: rotate(-45deg);
            }
            
            .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-minimize {
                -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,13H5V11H19V13Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
                mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,13H5V11H19V13Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
            }
        `);
        });
    }

}

export interface CssStyle {
    addRule(rule: string): void;
}

export interface Theme {
    (collector: CssStyle): void;
}

function _applyRules(styleSheetContent: string, rulesClassName: string) {
    let themeStyles = document.head.getElementsByClassName(rulesClassName);

    if (themeStyles.length === 0) {
        let styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.className = rulesClassName;
        styleElement.innerHTML = styleSheetContent;
        document.head.appendChild(styleElement);
    } else {
        (<HTMLStyleElement>themeStyles[0]).innerHTML = styleSheetContent;
    }
}
