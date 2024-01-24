import { MealPeriod, Day } from "@butlerhospitality/shared";
import { IsNotEmpty, IsBoolean, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IOperatingHours } from "../hotel/entity";

interface IAvailabilityTime {
  isActive: boolean;
  startTime: Date;
  endTime: Date;
}

interface IDefaultOperatingHours {
  startTime: string,
  endTime: string,
  isAvailable: boolean,
  isWebEnabled: boolean
}

interface IAvailabilityDay {
  isAvailable: boolean;
  isWebEnabled: boolean;
  Monday: Day;
  Tuesday: Day;
  Wednesday: Day;
  Thursday: Day;
  Friday: Day;
  Saturday: Day;
  Sunday: Day;
}

class AvailabilityTime implements IAvailabilityTime {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @IsNotEmpty()
  startTime: Date;

  @IsNotEmpty()
  endTime: Date;
}

class AvailabilityDay implements IAvailabilityDay {
  @IsBoolean()
  @IsNotEmpty()
  isAvailable: boolean;

  @IsBoolean()
  @IsOptional()
  isWebEnabled: boolean;

  @IsNotEmpty()
  @Type(() => AvailabilityTime)
  Monday: Day;

  @IsNotEmpty()
  @Type(() => AvailabilityTime)
  Tuesday: Day;

  @IsNotEmpty()
  @Type(() => AvailabilityTime)
  Wednesday: Day;

  @IsNotEmpty()
  @Type(() => AvailabilityTime)
  Thursday: Day;

  @IsNotEmpty()
  @Type(() => AvailabilityTime)
  Friday: Day;

  @IsNotEmpty()
  @Type(() => AvailabilityTime)
  Saturday: Day;

  @IsNotEmpty()
  @Type(() => AvailabilityTime)
  Sunday: Day;
}

export class OperatingHoursValidation implements IOperatingHours {
  @IsNotEmpty()
  @Type(() => AvailabilityDay)
  @ValidateNested({ each: true })
  [MealPeriod.Breakfast]: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDay)
  [MealPeriod.Lunch_Dinner]: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDay)
  [MealPeriod.Convenience]: string;
}

export const genDefaultOperatingHours = (data: IDefaultOperatingHours) => {
  const ob = { isAvailable: data.isAvailable, isWebEnabled: data.isWebEnabled };
  Object.keys(Day).forEach((day) => {
    ob[day] = {
      isActive: true,
      startTime: data.startTime,
      endTime: data.endTime
    };
  });
  return ob;
};

export const getDefaultOperatingHours = (categories: MealPeriod[]): { [key: string]: { [key: string]: string } } => {
  const result = {};
  categories.forEach((period: MealPeriod) => {
    if (!MealPeriod[period]) {
      throw new Error(`Provided period/category ${period} does not exist in ${MealPeriod}`);
    }
    switch (period) {
    case MealPeriod.Breakfast:
      result[period] = genDefaultOperatingHours({ startTime: "06:30 AM", endTime: "11:30 AM", isAvailable: true, isWebEnabled: true });
      break;
    case MealPeriod.Lunch_Dinner:
      result[period] = genDefaultOperatingHours({ startTime: "11:30 AM", endTime: "11:30 PM", isAvailable: true, isWebEnabled: true });
      break;
    case MealPeriod.Convenience:
      result[period] = genDefaultOperatingHours({ startTime: "06:30 AM", endTime: "11:30 PM", isAvailable: true, isWebEnabled: true });
      break;
    }
  });

  return result;
};
