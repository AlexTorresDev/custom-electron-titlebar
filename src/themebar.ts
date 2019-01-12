import { GlobalTitlebar } from './global';
  
export class Themebar {
  /**
   * get an `HTMLStyleElement` with the style of the **windows** type buttons
   */
  static readonly win = new GlobalTitlebar().$('style', {}, `
    .titlebar .window-controls-container .window-icon-bg {
      display: inline-block;
      -webkit-app-region: no-drag;
      height: 100%;
      width: 46px;
    }
    
    .titlebar .window-controls-container .window-icon-bg:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .titlebar .window-controls-container .window-icon-bg .window-icon {
      height: 100%;
      width: 100%;
      -webkit-mask-size: 23.1% !important;
      mask-size: 23.1% !important;
    }
    
    .titlebar .window-controls-container .window-icon-bg .window-icon.window-close {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
    }
    
    .titlebar .window-controls-container .window-icon-bg .window-icon.window-close:hover {
      background-color: #ffffff;
    }
    
    .titlebar .window-controls-container .window-icon-bg .window-icon.window-unmaximize {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
    }
    
    .titlebar .window-controls-container .window-icon-bg .window-icon.window-maximize {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
    }
    
    .titlebar .window-controls-container .window-icon-bg .window-icon.window-minimize {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
    }
    
    .titlebar .window-controls-container .window-icon-bg.window-close-bg:hover {
      background-color: rgba(232, 17, 35, 0.9)!important;
    }
    
    .titlebar .window-controls-container .window-icon-bg.inactive {
      background-color: transparent!important;
    }
    
    .titlebar .window-controls-container .window-icon-bg.inactive .window-icon {
      opacity: .4;
    }
    
    .titlebar.light>.window-controls-container>.window-icon-bg:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `) as HTMLStyleElement;

  /**
   * get an `HTMLStyleElement` with the style of the **mac** type buttons
   */
  static readonly mac = new GlobalTitlebar().$('style', {}, `
    .titlebar .window-controls-container .window-icon-bg {
      display: inline-block;
      -webkit-app-region: no-drag;
      height: 15px;
      width: 15px;
      margin: 7.5px 6px;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .titlebar .window-controls-container .window-icon-bg.inactive {
      background-color: #cdcdcd;
    }
    
    .titlebar .window-controls-container .window-icon-bg:nth-child(2n) {
      order: -1;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-icon {
      height: 100%;
      width: 100%;
      background-color: transparent;
      -webkit-mask-size: 100% !important;
      mask-size: 100% !important;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-icon:hover {
      background-color: rgba(0, 0, 0, 0.4);
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive):first-child {
      background-color: #febc28;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive):first-child:hover {
      background-color: #feb30a;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive):nth-child(2n) {
      background-color: #01cc4e;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive):nth-child(2n):hover {
      background-color: #01ae42;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg {
      background-color: #ff5b5d;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg:hover {
      background-color: #ff3c3f;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive).window-close-bg .window-close {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-maximize {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      transform: rotate(-45deg);
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-unmaximize {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.41,7.41L10,12L5.41,16.59L4,15.17L7.17,12L4,8.83L5.41,7.41M18.59,16.59L14,12L18.59,7.42L20,8.83L16.83,12L20,15.17L18.59,16.59Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.41,7.41L10,12L5.41,16.59L4,15.17L7.17,12L4,8.83L5.41,7.41M18.59,16.59L14,12L18.59,7.42L20,8.83L16.83,12L20,15.17L18.59,16.59Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      transform: rotate(-45deg);
    }
    
    .titlebar .window-controls-container .window-icon-bg:not(.inactive) .window-minimize {
      -webkit-mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,13H5V11H19V13Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
      mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19,13H5V11H19V13Z' fill='%23000'/%3E%3C/svg%3E") no-repeat 50% 50%;
    }
  `) as HTMLStyleElement;
}
