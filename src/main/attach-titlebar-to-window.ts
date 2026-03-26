/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */
import { WINDOW_MIN_HEIGHT, WINDOW_MIN_WIDTH } from 'consts'
import { BrowserWindow } from 'electron'

export interface AttachTitlebarToWindowOptions {
	minWidth?: number
	minHeight?: number
	/**
	 * Absolute path to a theme config JSON file to load in main and deliver to renderer.
	 */
	themeConfigPath?: string
}

type DetachListeners = () => void

const attachedWindows = new WeakMap<BrowserWindow, DetachListeners>()

export default (browserWindow: BrowserWindow, options: AttachTitlebarToWindowOptions = {}): DetachListeners => {
	const existingDetach = attachedWindows.get(browserWindow)
	if (existingDetach) {
		return existingDetach
	}

	// Use window's current size as minimum if not explicitly provided
	const [windowWidth, windowHeight] = browserWindow.getSize()
	const minWidth = Number.isFinite(options.minWidth) 
		? Math.max(0, Math.floor(options.minWidth!)) 
		: Math.max(windowWidth, WINDOW_MIN_WIDTH)
	const minHeight = Number.isFinite(options.minHeight) 
		? Math.max(0, Math.floor(options.minHeight!)) 
		: Math.max(windowHeight, WINDOW_MIN_HEIGHT)
	browserWindow.setMinimumSize(minWidth, minHeight)

	const emit = (channel: string, value: boolean) => {
		if (!browserWindow.isDestroyed()) {
			browserWindow.webContents.send(channel, value)
		}
	}

	const onEnterFullScreen = () => emit('window-fullscreen', true)
	const onLeaveFullScreen = () => emit('window-fullscreen', false)
	const onFocus = () => emit('window-focus', true)
	const onBlur = () => emit('window-focus', false)
	const onMaximize = () => emit('window-maximize', true)
	const onUnmaximize = () => emit('window-maximize', false)

	browserWindow.on('enter-full-screen', onEnterFullScreen)
	browserWindow.on('leave-full-screen', onLeaveFullScreen)
	browserWindow.on('focus', onFocus)
	browserWindow.on('blur', onBlur)
	browserWindow.on('maximize', onMaximize)
	browserWindow.on('unmaximize', onUnmaximize)

	const detach = () => {
		browserWindow.removeListener('enter-full-screen', onEnterFullScreen)
		browserWindow.removeListener('leave-full-screen', onLeaveFullScreen)
		browserWindow.removeListener('focus', onFocus)
		browserWindow.removeListener('blur', onBlur)
		browserWindow.removeListener('maximize', onMaximize)
		browserWindow.removeListener('unmaximize', onUnmaximize)
		attachedWindows.delete(browserWindow)
	}

	attachedWindows.set(browserWindow, detach)
	browserWindow.once('closed', detach)

	return detach
}