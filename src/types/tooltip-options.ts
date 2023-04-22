/*---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresDev. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface TooltipOptions {
    /**
     * The tooltip of minimize button.
     * **The default is "Minimize"**
     */
    minimize?: string;
    /**
     * The tooltip of maximize button.
     * **The default is "Maximize"**
     */
    maximize?: string;
    /**
     * The tooltip of restore button.
     * **The default is "Restore Down"**
     */
    restoreDown?: string;
    /**
     * The tooltip of close button.
     * **The default is "Close"**
     */
    close?: string;
}