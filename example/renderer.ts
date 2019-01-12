import { Titlebar, Themebar } from '..';

new Titlebar('#37474f', {
  icon: './icon.svg',
  shadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
  maximizable: false,
  iconsStyle: Themebar.mac
});
