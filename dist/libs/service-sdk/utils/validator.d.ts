import { ValidationError as ClassValidationError } from "class-validator";
export declare const prettyError: (errors: ClassValidationError[]) => any[];
export declare const validateInput: (payload: any) => Promise<string[]>;
