import { FormControl, ValidationErrors } from "@angular/forms";

export class ShopValidators {
    // whitespace validation
    static notOnlyWhitespace(control: FormControl) : ValidationErrors | null {
        //console.log(`control.value: -->${control.value}<--`)
        if((control.value != null) && (control.value.trim().length === 0)){
            // invalid, return error object
            return { 'notOnlyWhitespace': true };
        }
        else{
            return null;
        }
    }
}
