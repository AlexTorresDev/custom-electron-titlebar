/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import { TitlebarThemeConfig, TitlebarThemeColors } from './options'

export const TITLEBAR_THEME_CONFIG_VERSION = 1 as const

type UnknownRecord = Record<string, unknown>

export interface VersionedTitlebarThemeConfig extends TitlebarThemeConfig {
	version?: number
}

export interface ThemeConfigNormalizationResult {
	config: TitlebarThemeConfig | null
	warnings: string[]
}

function asRecord(input: unknown): UnknownRecord | null {
	if (!input || typeof input !== 'object' || Array.isArray(input)) {
		return null
	}

	return input as UnknownRecord
}

function asString(input: unknown): string | undefined {
	if (typeof input !== 'string') {
		return undefined
	}

	const value = input.trim()
	return value.length ? value : undefined
}

function asFiniteNumber(input: unknown): number | undefined {
	if (typeof input !== 'number' || !Number.isFinite(input)) {
		return undefined
	}

	return input
}

function sanitizeColors(input: unknown): TitlebarThemeColors | undefined {
	const source = asRecord(input)
	if (!source) {
		return undefined
	}

	const colors: TitlebarThemeColors = {
		titlebar: asString(source.titlebar),
		titlebarForeground: asString(source.titlebarForeground),
		menuBar: asString(source.menuBar),
		menuItemSelection: asString(source.menuItemSelection),
		menuSeparator: asString(source.menuSeparator),
		svg: asString(source.svg)
	}

	const hasAnyColor = !!(
		colors.titlebar ||
		colors.titlebarForeground ||
		colors.menuBar ||
		colors.menuItemSelection ||
		colors.menuSeparator ||
		colors.svg
	)

	return hasAnyColor ? colors : undefined
}

export function normalizeThemeConfig(input: unknown): ThemeConfigNormalizationResult {
	const warnings: string[] = []
	const source = asRecord(input)
	if (!source) {
		return { config: null, warnings: ['Theme config must be a JSON object.'] }
	}

	const requestedVersion = asFiniteNumber(source.version)
	if (requestedVersion !== undefined && requestedVersion !== TITLEBAR_THEME_CONFIG_VERSION) {
		warnings.push(`Theme config version ${requestedVersion} is not fully supported. Falling back to v${TITLEBAR_THEME_CONFIG_VERSION} compatible fields.`)
	}

	const config: VersionedTitlebarThemeConfig = {
		fontFamily: asString(source.fontFamily),
		fontSize: asFiniteNumber(source.fontSize),
		colors: sanitizeColors(source.colors)
	}

	const hasConfig = !!(config.fontFamily || config.fontSize !== undefined || config.colors)
	if (!hasConfig) {
		return { config: null, warnings: warnings.concat('No supported theme fields found in config.') }
	}

	return { config, warnings }
}
