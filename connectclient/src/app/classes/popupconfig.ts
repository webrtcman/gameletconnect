import { Vector2 } from 'src/app/classes/vector2';
import { WindowType } from './enums';


export class PopupConfig {

    windowType: WindowType;
    
    customTitle: string;
    customMessage: string;
    bDismissable: boolean;
    bCustomBtn: boolean;
    customBtnText: string;
    callback: any;
    bCallbackOnDismiss: boolean

    /**
     * Config for showing a custom popup window. 
     *
     * @param windowType Defines the theme of the popup (info, warning, danger)
     * @param customTitle The title of the popup
     * @param customMessage The message text of the popup
     * @param bDismissable Defines wether to place a close button in the top right corner. Default is true
     * @param bCustomBtn  Defines wether to place a custom button in the bottom. Default is false
     * @param customBtnText The text of the custom button Default is ''
     * @param callback  optional callback on click on the custom button. Default is null
     * @param bCallbackOnDismiss Defines wether the custom callback is fired when using the dismiss button to close the popup (if enabled). Default is false
     */
    constructor(
        windowType: WindowType,
        customTitle: string,
        customMessage: string,
        bDismissable:boolean = true,
        bCustomBtn: boolean = false,
        customBtnText: string = '',
        callback: any = null,
        bCallbackOnDismiss: boolean = false
    ) {
        this.windowType = windowType;
        this.customTitle = customTitle;
        this.customMessage = customMessage;
        this.bDismissable = bDismissable;
        this.bCustomBtn = bCustomBtn;
        this.customBtnText = customBtnText;
        this.callback = callback;
        this.bCallbackOnDismiss = bCallbackOnDismiss;
    }

}