export function $<T extends HTMLElement>(description: string, attrs?: { [key: string]: any; }, ...children: (Node | string)[]): T {
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