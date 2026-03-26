/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import attachTitlebarToWindow from './attach-titlebar-to-window'
import type { AttachTitlebarToWindowOptions } from './attach-titlebar-to-window'
import setupTitlebar, { setThemeConfig } from './setup-titlebar'
import { BrowserWindow } from 'electron'
import * as fs from 'fs/promises'
import { normalizeThemeConfig } from 'titlebar/theme-config'

export interface SetupAndAttachTitlebarOptions extends AttachTitlebarToWindowOptions {
	setupGlobal?: boolean
}

export async function setupTitlebarAndAttachToWindow(browserWindow: BrowserWindow, options: SetupAndAttachTitlebarOptions = {}) {
	if (options.setupGlobal !== false) {
		setupTitlebar()
	}

	// Load theme config from file if path provided
	if (options.themeConfigPath) {
		try {
			const raw = await fs.readFile(options.themeConfigPath, 'utf8')
			const parsed = JSON.parse(raw)
			const normalized = normalizeThemeConfig(parsed)
			if (normalized.warnings.length) {
				console.warn(`[custom-electron-titlebar] Theme config from ${options.themeConfigPath}:`, normalized.warnings.join('; '))
			}
			if (normalized.config) {
				setThemeConfig(normalized.config)
			}
		} catch (err) {
			console.error(`[custom-electron-titlebar] Failed to load theme config from ${options.themeConfigPath}:`, err)
		}
	}

	return attachTitlebarToWindow(browserWindow, options)
}

export {
	setupTitlebar,
	attachTitlebarToWindow
}

export type {
	AttachTitlebarToWindowOptions
}
