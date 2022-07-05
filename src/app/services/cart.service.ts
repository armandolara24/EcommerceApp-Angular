import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  //totalPrice: Subject<number> = new Subject<number>();
  //totalQuantity: Subject<number> = new Subject<number>();
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  storage: Storage = sessionStorage;
  //storage: Storage = localStorage;

  constructor() {
    // read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if (data != null) {
      this.cartItems = data;

      // compute totals based on the data that is read from storage
      this.computeCartTotals();
    }
  }

  addToCart(cartItem: CartItem) {
    // check if item is already in cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined!;

    if (this.cartItems.length > 0) {
      // find item in cart by item id
      /* // for was refactored
      for(let iCartItem of this.cartItems){
        if (cartItem.id === iCartItem.id){
          existingCartItem = iCartItem;
          break;
        }
        
      }
      */
      existingCartItem = this.cartItems.find(iCartItem => iCartItem.id === cartItem.id)!;

      // check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }


    // chec if we found the item
    if (alreadyExistsInCart) {
      // increment quantity
      existingCartItem.quantity++;
    } else {
      // just add the item to array
      this.cartItems.push(cartItem);
    }

    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let cartItem of this.cartItems) {
      totalPriceValue += cartItem.quantity * cartItem.unitPrice;
      totalQuantityValue += cartItem.quantity;
    }

    // publish the new values ... all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue)

    // log cart data for debugging purposes
    //this.logCartData(totalPriceValue, totalQuantityValue);

    // persist cart data
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  /* // used for debugging only
    logCartData(totalPriceValue: number, totalQuantityValue: number) {
      for(let cartItem of this.cartItems){
        const subTotalPrice = cartItem.quantity * cartItem.unitPrice;
        console.log(`name: ${cartItem.name}, quantity= ${cartItem.quantity}, unitPrice=${cartItem.unitPrice}, subTotalPrice: ${subTotalPrice}`)
      }
      console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity:${totalQuantityValue}`)
      console.log('------')
    }
  */
  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;
    if (cartItem.quantity == 0) {
      this.remove(cartItem);
    } else {
      this.computeCartTotals();
    }
  }
  remove(cartItem: CartItem) {
    // get index of item in array
    const itemIndex = this.cartItems.findIndex(iCartItem => iCartItem.id == cartItem.id)

    //if found, remove the item
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }

}
