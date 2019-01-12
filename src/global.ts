const Color = require('color');

export class GlobalTitlebar {
	$<T extends HTMLElement>(description: string, attrs?: { [key: string]: any; }, ...children: (Node | string)[]): T {
		let match = /([\w\-]+)?(#([\w\-]+))?((.([\w\-]+))*)/.exec(description);

		if (!match) {
			throw new Error('Bad use of emmet');
		}

		let result = document.createElement(match[1] || 'div');

		if (match[3]) {
			result.id = match[3];
		}
		if (match[4]) {
			result.className = match[4].replace(/\./g, ' ').trim();
		}

		attrs = attrs || {};
		Object.keys(attrs).forEach(name => {
			const value = attrs![name];
			if (/^on\w+$/.test(name)) {
				(<any>result)[name] = value;
			} else {
				result.setAttribute(name, value);
			}
		});

		children.forEach(child => {
			if (child instanceof Node) {
				result.appendChild(child);
			} else {
				result.appendChild(document.createTextNode(child as string));
			}
		});

		return result as T;
	}

	setColors(color: string): void {
		let styleElement = document.getElementById('titlebar-style-icons');
		let style: HTMLStyleElement | HTMLElement;
	
		if(!styleElement) {
			style = this.$('style#titlebar-style-icons');
		} else {
			style = styleElement;
		}
	
		style.textContent = `.titlebar > .window-controls-container .window-icon {
			background-color: ${Color(color).isDark() && color !== 'transparent' ? '#ffffff' : '#333333'};
		}
		
		.menu-container .menu-item-check, .menu-container .submenu-indicator {
			background-color: ${Color(color).isDark() && color !== 'transparent' ? '#ffffff' : '#333333'};
		}`;
	
		if(!styleElement) document.head.appendChild(style);
	
		document.querySelectorAll<HTMLElement>('.menubar-menu-items-holder').forEach(menu => {
			menu.style.backgroundColor = color !== 'transparent' ? Color(color).darken(0.12) : '#EDEDED';
			menu.style.color = Color(color).isDark() && color !== 'transparent' ? '#ffffff' : '#333333';;
		});
	}
}