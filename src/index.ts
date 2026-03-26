/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import { CustomTitlebar } from './titlebar'
import { Color } from 'base/common/color'
import type { TitleBarOptions, TitlebarThemeConfig } from './titlebar/options'

export const createTitlebar = (options: TitleBarOptions = {}) => new CustomTitlebar(options)

export const createTitlebarOnDOMContentLoaded = (options: TitleBarOptions = {}) => {
	if (document.readyState === 'loading') {
		return new Promise<CustomTitlebar>((resolve) => {
			window.addEventListener('DOMContentLoaded', () => resolve(new CustomTitlebar(options)), { once: true })
		})
	}

	return Promise.resolve(new CustomTitlebar(options))
}

export {
	CustomTitlebar,
	CustomTitlebar as Titlebar,
	Color as TitlebarColor
}

export type {
	TitleBarOptions,
	TitlebarThemeConfig
}
