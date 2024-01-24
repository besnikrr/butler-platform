import { ITenant } from "../base";

export const mockedTenant: ITenant = {
  id: 1,
  cognito: {
    poolId: "us-east-1_Tq29inz5l",
    clientId: "7nn3c7l878r6t3vh4mh92ubpl2"
  },
  domain: "http://butler.butlerplatform.com",
  jwks: "",
  name: "Butler Tenant",
  awsDefaultRegion: "us-east-1"
};
