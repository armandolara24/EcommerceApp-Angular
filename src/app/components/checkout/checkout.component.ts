import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { ShopFormService } from 'src/app/services/shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice:number=0.00;
  totalQuantity:number=0;

  creditCardMonths:number[] = [];
  creditCardYears:number[] = [];

  countries: Country[] = [];

  shippingAddressStates : State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, private shopFormService: ShopFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']}),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        secutityCode:[''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // populate credit card months
    const startMonth:number = new Date().getMonth() + 1;
    //console.log("startMonth: " + startMonth);

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        //console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card years
    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        //sconsole.log('Retrieved credit card years: ' + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    // populate countries
    this.shopFormService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    );
  }

  copyShippingAddressToBillingAddress(event: { target: { checked: any; }; }) {
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value)
      this.billingAddressStates = this.shippingAddressStates;
    }else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }

  }

  onSubmit() {
    /*
    console.log("Handling submit button")
    console.log(this.checkoutFormGroup.get('customer')!.value);
    */
  }

  handleMonthsAndYears(){

    let creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    let currentYear = new Date().getFullYear();
    let selectedYear = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    if(currentYear == selectedYear){
      startMonth = new Date().getMonth() + 1;
    } else{
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        //console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

  }

  getStates(formGroupName:string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    //const countryName = formGroup?.value.country.name;

    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName == 'shippingAddress'){
          this.shippingAddressStates = data;
        } else{
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
  
}
