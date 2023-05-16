import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  cartDataResponse: CartType | null = null;
  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;
  constructor(private favoriteService: FavoriteService,
              private cartService:CartService) {
  }

  ngOnInit(): void {
   this.getProductsWithCheckCart();
  }

  getProductsWithCheckCart() {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.cartService.getCart()
          .subscribe((cartData: CartType | DefaultResponseType) => {
            if ((cartData as DefaultResponseType).error !== undefined) {
              this.products = data as FavoriteType[];
              throw new Error((cartData as DefaultResponseType).message);
            }
            const cartDataResponse = cartData as CartType;
            this.products = (data as FavoriteType[]).map(product => {
              if (cartDataResponse) {
                console.log(cartDataResponse)
                const productInCart = cartDataResponse.items.find(item => item.product.id === product.id);
                if (productInCart) {
                  product.countInCart = productInCart.quantity;
                }
              }
              return product;
            });
          });
      });
  }

  removeFromFavorites(id:string) {
this.favoriteService.removeFavourite(id)
  .subscribe((data:DefaultResponseType) => {
    if (data.error) {
      //..
      throw new Error(data.message);
    }

    this.products = this.products.filter(item => item.id !== id)
  })
}
  addToCart(id:string, count: number) {
    this.cartService.updateCart(id, count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw  new Error((data as DefaultResponseType).message)
        }
       this.getProductsWithCheckCart();
      });
  }
  updateCount(value: number, product: FavoriteType) {
    let count = value;
    if (product.countInCart){
      this.cartService.updateCart(product.id, count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw  new Error((data as DefaultResponseType).message)
          }
          product.countInCart = count;
        })
    }
  }

}
