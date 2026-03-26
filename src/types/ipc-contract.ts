/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import { TitleBarOverlay } from 'electron'

/**
 * Central IPC contract defining all channels and their payloads
 * Ensures type-safe communication between main and renderer processes
 */

// Window event names
export type WindowEventName = 'window-minimize' | 'window-maximize' | 'window-close'

// IPC Channel definitions with Request/Response types
export interface IpcContract {
	// Window state queries (async - use invoke)
	'window-event:is-maximized': {
		request: void
		response: boolean
	}

	// Title bar overlay update (async - use invoke)
	'update-window-controls': {
		request: TitleBarOverlay
		response: boolean
	}

	// Menu icon request (async - use invoke)
	'menu-icon:request': {
		request: number // commandId
		response: string | null // dataURL or null
	}

	// Application menu request (async - use invoke)
	'request-application-menu': {
		request: void
		response: Electron.Menu
	}

	// Theme configuration delivery (async - use invoke)
	'theme-config:get': {
		request: void
		response: Record<string, unknown> | null // normalized theme config
	}
}

// Fire-and-forget channels (use send/on)
export interface IpcFireAndForgetContract {
	// Window control events
	'window-event': {
		payload: WindowEventName
	}
	// Menu item click events
	'menu-event': {
		payload: number // commandId
	}
	// Minimum size setter
	'window-set-minimumSize': {
		payload: [number, number] // [width, height]
	}
	// Title bar overlay update (sync alternative)
	'update-window-controls': {
		payload: TitleBarOverlay
	}
}

/**
 * Type-safe channel name extractors
 */
export const IpcChannels = {
	// Async (invoke/handle)
	GET_WINDOW_MAXIMIZED: 'window-event:is-maximized' as const,
	UPDATE_WINDOW_CONTROLS: 'update-window-controls' as const,
	REQUEST_MENU_ICON: 'menu-icon:request' as const,
	REQUEST_APPLICATION_MENU: 'request-application-menu' as const,

	// Fire-and-forget (send/on)
	WINDOW_EVENT: 'window-event' as const,
	MENU_EVENT: 'menu-event' as const,
	SET_MINIMUM_SIZE: 'window-set-minimumSize' as const,
	GET_THEME_CONFIG: 'theme-config:get' as const,
} as const

/**
 * Extract response type for a given channel
 */
export type IpcResponse<C extends keyof IpcContract> = IpcContract[C]['response']
export type IpcRequest<C extends keyof IpcContract> = IpcContract[C]['request']
