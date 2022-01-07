import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[];
  currentCategoryId: number;
  searchMode: boolean;

  constructor(private productService: ProductService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe( () => {
        this.listProducts();
    });
  }

  listProducts(){
    this.searchMode = this.route.snapshot.paramMap.has("keyword");
    if(this.searchMode){
      this.handleSearchProducts();
    }else{
      this.handleProducts();
    }
  }

  handleProducts(){
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has("id");

    if (hasCategoryId) {
      // get the "id" param string, convert string to a number using the '+' symbol
      this.currentCategoryId = Number(this.route.snapshot.paramMap.get("id"));
    } else {
      // not category id available... default to category id 1
      this.currentCategoryId = 1;
    }
    console.log(this.currentCategoryId);

    this.productService.getProductList(this.currentCategoryId).subscribe(
      data => {
        this.products = data;
      }
    )
  }

  handleSearchProducts() {
    let keyword: string = "";
    const tmpkeyword: unknown = this.route.snapshot.paramMap.get("keyword");

    if (typeof tmpkeyword === "string") {
      // TypeScript knows that keyword is a string
      keyword = tmpkeyword;
    }

   // now search for products using keyword
      this.productService.searchProducts(keyword).subscribe(
     data => {
       this.products = data; 
     }
   );
  }

}
