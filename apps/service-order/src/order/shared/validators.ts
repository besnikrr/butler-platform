import { Type } from "class-transformer";
import {
  IsArray, IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Length,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { OrderType, PaymentGateway } from "./enums";
import { PaymentType } from "@butlerhospitality/shared";
import { IBaseOrderInput, IClient, ICustomProduct, IDiscount, IHotel, IProduct, IVoucher } from "./interfaces";

class OrderClientInput implements IClient {
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  name!: string;

  @IsOptional()
  @IsEmail()
  @Length(0, 50)
  email?: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  @Length(0, 50)
  phoneNumber!: string;
}

class OrderProductInput implements IProduct {
  @IsOptional()
  @IsInt()
  @IsPositive()
  id: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  productId: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  name!: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  categoryId!: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  categoryName!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  options: number[];

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  originalPrice?: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  codeId?: number;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  code?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  ruleId?: number;
}

class OrderCustomProductInput implements ICustomProduct {
  @IsOptional()
  @IsInt()
  @IsPositive()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity!: number;
}

class OrderHotelInput implements IHotel {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id!: number;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  hubId!: number;

  @IsNotEmpty()
  @IsString()
  hubName!: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  menuId!: number;

  @IsNotEmpty()
  @IsString()
  roomNumber!: string;
}

class OrderVoucherInput implements IVoucher {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id!: number;

  @IsNotEmpty()
  @IsString()
  code!: string;
}

class OrderDiscountInput implements IDiscount {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  id: number;

  @IsNotEmpty()
  @IsString()
  code!: string;
}

@ValidatorConstraint({ name: "scheduledDateConstraint", async: false })
export class ScheduledDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, _: ValidationArguments) {
    if (!dateString) {
      return true;
    }

    const orderWindowDate = new Date();
    orderWindowDate.setUTCMinutes(orderWindowDate.getUTCMinutes() + 45);
    const scheduledDate = new Date(dateString);

    return orderWindowDate <= scheduledDate ? true : false;
  }

  defaultMessage(_: ValidationArguments) {
    return "The scheduled date must be at least 45 minutes from now";
  }
}

export class BaseOrderInput implements IBaseOrderInput {
  @IsOptional()
  @IsString()
  @Length(0, 500)
  comment?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OrderClientInput)
  client!: IClient;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  tip!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  tax!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalNet!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalGross!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  grandTotal!: number;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  receiptAmount!: number;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsNotEmpty()
  @IsEnum(OrderType)
  type!: OrderType;

  @IsOptional()
  @IsString()
  nonce?: string;

  @IsNotEmpty()
  @IsInt()
  cutlery!: number;

  @IsOptional()
  @Validate(ScheduledDateConstraint)
  scheduledDate?: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => OrderProductInput)
  @ValidateNested({ each: true })
  products!: IProduct[];

  @IsNotEmpty()
  @IsArray()
  @Type(() => OrderCustomProductInput)
  @ValidateNested({ each: true })
  customProducts!: ICustomProduct[];

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderVoucherInput)
  voucher?: IVoucher;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderDiscountInput)
  discount?: IDiscount;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OrderHotelInput)
  hotel!: IHotel;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType!: PaymentType;

  @IsOptional()
  @IsEnum(PaymentGateway)
  paymentGateway?: PaymentGateway;
}

