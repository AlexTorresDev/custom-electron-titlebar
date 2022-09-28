/*---------------------------------------------------------------------------------------------
 *  Copyright (c) AlexTorresSk. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color } from "vs/base/common/color";

export const applyFill = (element: Element | undefined | null, svgColor: Color | undefined, fgColor: Color | undefined) => {
    let fillColor = '';

    if (svgColor) fillColor = svgColor.toString();
    else if (fgColor) fillColor = fgColor.toString();

    if (element && element !== null) element.setAttribute('fill', fillColor);
}