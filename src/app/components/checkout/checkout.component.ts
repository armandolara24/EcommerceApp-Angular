import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { ShopValidators } from 'src/app/validators/shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  storage : Storage = sessionStorage;

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
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    // read user's email address from browser storage
    const email = JSON.parse(this.storage.getItem('userEmail')!);

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
        email: new FormControl(email,
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
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

        // reset cart
        this.resetCart();

      },
      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    }
    );
  }

  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.checkoutFormGroup.reset();
    this.router.navigateByUrl("/products");
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
