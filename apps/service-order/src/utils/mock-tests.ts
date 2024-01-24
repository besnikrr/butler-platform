import { faker } from "@faker-js/faker";
import { OrderType, PaymentGateway } from "../order/shared/enums";
import { IVoucher } from "../order/shared/interfaces";
import { ICreateOrderInput } from "../order/usecases/create-order";
import { IUpdateOrderInput } from "../order/usecases/update-order";
import { IUpdatePaymentInput } from "../payment/usecases/update-payment";
import { PaymentType } from "@butlerhospitality/shared";

const generateMockPayment = (): IUpdatePaymentInput => {
  const mockPayment: IUpdatePaymentInput = {
    transactionId: faker.random.alphaNumeric()
  };

  return mockPayment;
};

const generateMockOrderInput = ({
  invalidHotelData = false,
  invalidProduct = false,
  invalidCategory = false,
  invalidModifiers = false,
  invalidPrice = false,
  invalidPaymentGateway = false,
  invalidVoucherCode = false,
  usePreFixeVoucher = false,
  usedVoucherCodePERDIEM = false,
  usedVoucherCodeDISCOUNT = false,
  codeWithInactiveProgram = false
}): ICreateOrderInput => {
  const mockOrderInput: ICreateOrderInput = {
    nonce: faker.random.alphaNumeric(),
    cutlery: faker.datatype.number({
      min: 0,
      max: 10
    }),
    paymentGateway: invalidPaymentGateway ? PaymentGateway.STRIPE : PaymentGateway.SQUARE,
    client: {
      name: faker.name.firstName() + " " + faker.name.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber("+1 415 475####")
    },
    tax: Number(faker.commerce.price(1, 25)),
    totalNet: Number(faker.commerce.price(1, 25)),
    totalGross: Number(faker.commerce.price(1, 25)),
    grandTotal: Number(faker.commerce.price(1, 25)),
    receiptAmount: Number(faker.commerce.price(1, 25)),
    type: OrderType.FAAS,
    tip: Number(faker.commerce.price(1, 10)),
    products: [
      {
        name: "Product4",
        productId: invalidProduct ? faker.datatype.number({ min: 100, max: 1000 }) : 4,
        categoryId: invalidCategory ? faker.datatype.number({
          min: 20,
          max: 50
        }) : 4,
        categoryName: "Sandwich",
        price: invalidPrice ? faker.datatype.number({ min: 500, max: 100 }) : 5,
        ...(Math.random() > 0.5 && {
          originalPrice: faker.datatype.number({
            min: 5,
            max: 20
          })
        }),
        quantity: faker.datatype.number({
          "min": 10,
          "max": 50
        }),
        options: invalidModifiers ? [16, 35] : [4, 5, 6],
        comment: faker.random.alphaNumeric(),
        ...(usePreFixeVoucher && {
          code: "XYXY4",
          codeId: 4,
          ruleId: 1
        })
      },
      {
        productId: invalidProduct ? faker.datatype.number({ min: 100, max: 1000 }) : 10,
        categoryId: invalidCategory ? faker.datatype.number({
          min: 20,
          max: 50
        }) : 4,
        categoryName: "Sandwich",
        price: invalidPrice ? faker.datatype.number({ min: 500, max: 100 }) : 5,
        name: "Product10",
        quantity: faker.datatype.number({
          "min": 10,
          "max": 50
        }),
        options: [],
        comment: faker.random.alphaNumeric()
      }
    ],
    customProducts: [],
    hotel: {
      id: invalidHotelData ? faker.datatype.number({
        "min": 10,
        "max": 50
      }) : 1,
      name: invalidHotelData ? faker.random.word() : "Millennium Downtown New York City",
      hubId: invalidHotelData ? faker.datatype.number({
        "min": 10,
        "max": 50
      }) : 1,
      hubName: invalidHotelData ? faker.random.word() : "New York Hub",
      roomNumber: "A-839",
      menuId: invalidHotelData ? faker.datatype.number({
        "min": 10,
        "max": 50
      }) : 1
    },
    ...(!usePreFixeVoucher && {
      voucher: generateVoucherCode({
        invalidVoucherCode,
        usedVoucherCodePERDIEM,
        usedVoucherCodeDISCOUNT,
        codeWithInactiveProgram
      })
    }),
    paymentType: PaymentType.CREDIT_CARD
  };

  return mockOrderInput;
};

const generateMockOrderUpdateInput = ({
  invalidVersion = false
}): IUpdateOrderInput => {
  const mockOrderUpdateInput: IUpdateOrderInput = {
    version: invalidVersion ? faker.datatype.number({
      min: 20,
      max: 50
    }) : 1,
    ...generateMockOrderInput({})
  };

  return mockOrderUpdateInput;
};

const generateVoucherCode = ({
  invalidVoucherCode = false,
  usedVoucherCodePERDIEM = false,
  usedVoucherCodeDISCOUNT = false,
  codeWithInactiveProgram = false
}): IVoucher => {
  if (codeWithInactiveProgram) {
    return {
      id: 10,
      code: "XYXY10"
    };
  }
  if (usedVoucherCodeDISCOUNT) {
    return {
      id: 1,
      code: "XYXY1"
    };
  }
  if (usedVoucherCodePERDIEM) {
    return {
      id: 9,
      code: "XYXY9"
    };
  }
  if (invalidVoucherCode) {
    return {
      id: 84,
      code: "XYXY5"
    };
  }
  return {
    id: 5,
    code: "XYXY5"
  };
};

export {
  generateMockPayment,
  generateMockOrderInput,
  generateMockOrderUpdateInput
};
