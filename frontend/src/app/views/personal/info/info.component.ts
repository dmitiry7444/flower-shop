import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {DeliveryType} from "../../../../types/delivery.type";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;

  userInfoForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: [''],
    fatherName: [''],
    paymentType: [PaymentType.cashToCourier],
    email: ['', Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
  });

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private _snackBar: MatSnackBar) {
  }


  ngOnInit() {
    this.userService.getUserInfo()
      .subscribe((data: UserInfoType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message)
        }
        const userInfo = data as UserInfoType;
        const paramsToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName: '',
          lastName: userInfo.lastName ? userInfo.lastName: '',
          phone: userInfo.phone ? userInfo.phone: '',
          fatherName: userInfo.fatherName ? userInfo.fatherName: '',
          paymentType:userInfo.paymentType ? userInfo.paymentType: PaymentType.cashToCourier,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street: '',
          house: userInfo.house ? userInfo.house: '',
          entrance: userInfo.entrance ? userInfo.entrance: '',
          apartment: userInfo.apartment ? userInfo.apartment: '',
        }

          this.userInfoForm.setValue(paramsToUpdate)
if (userInfo.deliveryType) {
  this.deliveryType = userInfo.deliveryType
}

      })
  }

  changeDeliveryType(type: DeliveryType) {
    this.deliveryType = type;
    this.userInfoForm.markAsDirty();
  }

  updateUserInfo() {
    if (this.userInfoForm.valid) {
      const paramObject: UserInfoType = {
        email: this.userInfoForm.value.email ? this.userInfoForm.value.email : '',
        deliveryType: this.deliveryType,
        paymentType: this.userInfoForm.value.paymentType ? this.userInfoForm.value.paymentType : PaymentType.cashToCourier,
      }
      if (this.userInfoForm.value.firstName) {
        paramObject.firstName = this.userInfoForm.value.firstName;
      }
      if (this.userInfoForm.value.lastName) {
        paramObject.lastName = this.userInfoForm.value.lastName;
      }
      if (this.userInfoForm.value.fatherName) {
        paramObject.fatherName = this.userInfoForm.value.fatherName;
      }
      if (this.userInfoForm.value.phone) {
        paramObject.phone = this.userInfoForm.value.phone;
      }
      if (this.userInfoForm.value.street) {
        paramObject.street = this.userInfoForm.value.street;
      }
      if (this.userInfoForm.value.apartment) {
        paramObject.apartment = this.userInfoForm.value.apartment;
      }
      if (this.userInfoForm.value.entrance) {
        paramObject.entrance = this.userInfoForm.value.entrance;
      }
      if (this.userInfoForm.value.house) {
        paramObject.house = this.userInfoForm.value.house;
      }

      this.userService.updateUserInfo(paramObject)
        .subscribe({
          next: (data: DefaultResponseType) => {
            if (data.error) {
              this._snackBar.open('Ошибка сохранения');
              throw new Error(data.message)
            }
            this._snackBar.open('Данные успешно сохранены');
            this.userInfoForm.markAsPristine();
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка сохранения');
            }
          }
        });
    }
  }
}
