import { Color } from "base/common/color";
import { isMacintosh, isWindows } from "base/common/platform";

export const INACTIVE_FOREGROUND_DARK = Color.fromHex('#222222')
export const ACTIVE_FOREGROUND_DARK = Color.fromHex('#333333')
export const INACTIVE_FOREGROUND = Color.fromHex('#EEEEEE')
export const ACTIVE_FOREGROUND = Color.fromHex('#FFFFFF')
export const DEFAULT_ITEM_SELECTOR = Color.fromHex('#0000001F')

export const IS_MAC_BIGSUR_OR_LATER = isMacintosh && parseInt(process.getSystemVersion().split(".")[0]) >= 11
export const BOTTOM_TITLEBAR_HEIGHT = '60px'
export const TOP_TITLEBAR_HEIGHT_MAC = IS_MAC_BIGSUR_OR_LATER ? '28px' : '22px'
export const TOP_TITLEBAR_HEIGHT_WIN = '32px'

export const WINDOW_MIN_WIDTH = 400
export const WINDOW_MIN_HEIGHT = 270

export const MENU_MNEMONIC_REGEX = /\(&([^\s&])\)|(^|[^&])&([^\s&])/
export const MENU_ESCAPED_MNEMONIC_REGEX = /(&amp;)?(&amp;)([^\s&])/g

/**
 * Handles mnemonics for menu items. Depending on OS:
 * - Windows: Supported via & character (replace && with &)
 * - Linux: Supported via & character (replace && with &)
 * - macOS: Unsupported (replace && with empty string)
 */
export function mnemonicMenuLabel(label: string, forceDisableMnemonics?: boolean): string {
	if (isMacintosh || forceDisableMnemonics) {
		return label.replace(/\(&&\w\)|&&/g, '').replace(/&/g, isMacintosh ? '&' : '&&');
	}

	return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
}

/**
 * Handles mnemonics for buttons. Depending on OS:
 * - Windows: Supported via & character (replace && with & and & with && for escaping)
 * - Linux: Supported via _ character (replace && with _)
 * - macOS: Unsupported (replace && with empty string)
 */
export function mnemonicButtonLabel(label: string, forceDisableMnemonics?: boolean): string {
	if (isMacintosh || forceDisableMnemonics) {
		return label.replace(/\(&&\w\)|&&/g, '');
	}

	if (isWindows) {
		return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
	}

	return label.replace(/&&/g, '_');
}

export function cleanMnemonic(label: string): string {
	const regex = MENU_MNEMONIC_REGEX;

	const matches = regex.exec(label);
	if (!matches) {
		return label;
	}

	const mnemonicInText = !matches[1];

	return label.replace(regex, mnemonicInText ? '$2$3' : '').trim();
}

export function parseAccelerator(accelerator: Electron.Accelerator | string): string {
	let acc = accelerator.toString();

	if (!isMacintosh) {
		acc = acc.replace(/(Cmd)|(Command)/gi, '');
	} else {
		acc = acc.replace(/(Ctrl)|(Control)/gi, '');
	}

	acc = acc.replace(/(Or)/gi, '');

	return acc;
}

export function applyFill(element: Element | undefined | null, svgColor: Color | undefined, fgColor: Color | undefined) {
	let fillColor = ''

	if (svgColor) fillColor = svgColor.toString()
	else if (fgColor) fillColor = fgColor.toString()

	if (element && element !== null) element.setAttribute('fill', fillColor)
}