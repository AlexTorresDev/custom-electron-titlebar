/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * @returns a new array with all falsy values removed. The original array IS NOT modified.
 */
export function coalesce<T>(array: Array<T | undefined | null>): T[] {
	if (!array) {
		return array;
	}
	return <T[]>array.filter(e => !!e);
}