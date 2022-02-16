import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { ShopValidators } from 'src/app/validators/shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, 
              private shopFormService: ShopFormService, 
              private cartService: CartService) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),
        email: new FormControl('',
          [Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]
        )
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),
        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('',
          [Validators.required,
          Validators.pattern('^[0-9]{16}$')]
        ),
        securityCode: new FormControl('',
          [Validators.required,
          Validators.pattern('^[0-9]{3}$')]
        ),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
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
  reviewCartDetails() {
    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName') as FormControl;; }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName') as FormControl;; }
  get email() { return this.checkoutFormGroup.get('customer.email') as FormControl; }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street') as FormControl; }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city') as FormControl; }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state') as FormControl; }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode') as FormControl; }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country') as FormControl; }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street') as FormControl; }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city') as FormControl; }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state') as FormControl; }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode') as FormControl; }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country') as FormControl; }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType') as FormControl; }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard') as FormControl; }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber') as FormControl; }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode') as FormControl; }

  copyShippingAddressToBillingAddress(event: { target: { checked: any; }; }) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value)
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }

  }

  onSubmit() {
    /*
    console.log("Handling submit button")
    console.log(this.checkoutFormGroup.get('customer')!.value);
    */
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }
  }

  handleMonthsAndYears() {

    let creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    let currentYear = new Date().getFullYear();
    let selectedYear = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    if (currentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        //console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    //const countryName = formGroup?.value.country.name;

    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName == 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }

}
