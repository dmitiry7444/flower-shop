import {Component, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../types/product.type";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  isLogged: boolean = false;
  count: number = 1;
  serverStaticPath = environment.serverStaticPath;
  product!: ProductType;
  recommendedProducts: ProductType[] = []

  customOptionsBestProducts: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }

  constructor(private productService: ProductService,
              private activatedRoute: ActivatedRoute,
              private favoriteService: FavoriteService,
              private _snackbar: MatSnackBar,
              private authService: AuthService,
              private cartService: CartService) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url'])
        .subscribe((data: ProductType) => {
          this.product = data;

          this.cartService.getCart()
            .subscribe((cartData: CartType | DefaultResponseType) => {
              if ((cartData as DefaultResponseType).error !== undefined) {
              throw new Error((cartData as DefaultResponseType).message);
            }
              const cartDataResponse = cartData as CartType;

              if (cartDataResponse) {
                const productInCart = cartDataResponse.items.find(item => item.product.id === data.id);
                if (productInCart) {
                  this.product.countInCart = productInCart.quantity;
                  this.count = this.product.countInCart;
                }
              }
            });
          if (this.authService.getIsLoggedIn()) {
            this.favoriteService.getFavorites()
              .subscribe((data: FavoriteType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error = (data as DefaultResponseType).message;
                  throw new Error(error);
                }
                const favouriteProducts = data as FavoriteType[];
                const currentProductExists = favouriteProducts.find(item => item.id === this.product.id);
                if (currentProductExists) {
                  this.product.isInFavorite = true;
                }
                if (favouriteProducts) {
                  this.recommendedProducts = this.recommendedProducts.map(product => {
                    const productInFavorite = favouriteProducts.find(item => item.id === product.id);
                    if (productInFavorite) {
                      product.isInFavorite = true;
                    }
                    return product;
                  })
                }
              });
          }
        })
    })


    this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        this.recommendedProducts = data
      })
  }

  updateCount(value: number) {
    this.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw  new Error((data as DefaultResponseType).message)
          }
          this.product.countInCart = this.count;
        })
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw  new Error((data as DefaultResponseType).message)
        }
        this.product.countInCart = this.count;
      });
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw  new Error((data as DefaultResponseType).message)
        }
        this.product.countInCart = 0;
        this.count = 1;
      })
  }

  updateFavorite() {
    if (!this.authService.getIsLoggedIn()) {
      this._snackbar.open('Для добавления в избранное необходимо авторизоваться')
      return;
    }
    if (this.product.isInFavorite) {
      this.favoriteService.removeFavourite(this.product.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            //..
            throw new Error(data.message);
          }

          this.product.isInFavorite = false;
        })
    } else {
      this.favoriteService.addFavourite(this.product.id)
        .subscribe((data: FavoriteType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw  new Error((data as DefaultResponseType).message)
          }

          this.product.isInFavorite = true;
        });
    }
  }
}
