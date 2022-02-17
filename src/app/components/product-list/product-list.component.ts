import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // new properties for pagination
  pageNumber: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;
  previousKeyword: string = "";

  constructor(private productService: ProductService,
    private route: ActivatedRoute, private cartService: CartService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has("keyword");
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleListProducts() {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has("id");

    if (hasCategoryId) {
      // get the "id" param string, convert string to a number using the '+' symbol
      this.currentCategoryId = Number(this.route.snapshot.paramMap.get("id"));
    } else {
      // not category id available... default to category id 1
      this.currentCategoryId = 1;
    }
    //console.log(`currentCategoryId=${this.currentCategoryId}`);

    //
    // check if we have adifferent category than previous
    // Note: Angular will reuse a component if it is currently being viewed
    //

    // if we have a different category id than the previous
    // then set the pageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.pageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;
    //console.log(`currentCategoryId=${this.currentCategoryId}, pageNumber=${this.pageNumber}`)

    // now get products for given category id
    this.productService.getProductListPaginate(
      this.pageNumber - 1,
      this.pageSize,
      this.currentCategoryId)
      .subscribe(data => {
        this.products = data._embedded.products;
        this.pageNumber = data.page.number + 1;
        this.pageSize = data.page.size;
        this.totalElements = data.page.totalElements;
      });
  }


  handleSearchProducts() {
    let keyword: string = "";
    const tmpkeyword: unknown = this.route.snapshot.paramMap.get("keyword");

    if (typeof tmpkeyword === "string") {
      // TypeScript knows that keyword is a string
      keyword = tmpkeyword;
    }

    if (keyword != this.previousKeyword) {
      this.pageNumber = 1;
    }
    this.previousKeyword = keyword;
    //console.log(`keyword=${keyword}, pageNumber=${this.pageNumber}`)

    /*
    // now search for products using keyword
    this.productService.searchProducts(keyword).subscribe(
      data => {
        this.products = data;
      }
    )
    */

    this.productService.searchProductsPaginate(this.pageNumber - 1,
      this.pageSize, keyword).subscribe(data => {
        this.products = data._embedded.products;
        this.pageNumber = data.page.number + 1;
        this.pageSize = data.page.size;
        this.totalElements = data.page.totalElements;
      })
  }

  updatePageSize(pageSize: number) {
    this.pageSize = pageSize;
    this.pageNumber = 1;
    this.listProducts();
  }

  addToCart(product:Product){
    //console.log(`Adding to cart: ${product.name}, ${product.unitPrice}`)

    const cartItem = new CartItem(product);

    this.cartService.addToCart(cartItem);
  }
}
