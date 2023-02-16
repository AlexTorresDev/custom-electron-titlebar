import { Color } from "base/common/color";
import { isMacintosh } from "base/common/platform";

export const INACTIVE_FOREGROUND_DARK = Color.fromHex('#222222');
export const ACTIVE_FOREGROUND_DARK = Color.fromHex('#333333');
export const INACTIVE_FOREGROUND = Color.fromHex('#EEEEEE');
export const ACTIVE_FOREGROUND = Color.fromHex('#FFFFFF');

export const IS_MAC_BIGSUR_OR_LATER = isMacintosh && parseInt(process.getSystemVersion().split(".")[0]) >= 11;
export const BOTTOM_TITLEBAR_HEIGHT = '60px';
export const TOP_TITLEBAR_HEIGHT_MAC = IS_MAC_BIGSUR_OR_LATER ? '28px' : '22px';
export const TOP_TITLEBAR_HEIGHT_WIN = '30px';