export interface ErrorObject {
	error: boolean;
	code: string;
	message: string;
}

export const generalError = (code: string, message: string): ErrorObject => {
  return {
    error: true,
    code,
    message
  };
};
