import { Buttons } from "./enums";

export class RtcButtonStatus {
    buttonType: Buttons;
    bActive: boolean;

    constructor(buttonType: Buttons, bActive: boolean) {
        this.buttonType = buttonType;
        this.bActive = bActive
    }
}