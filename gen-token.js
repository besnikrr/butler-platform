const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const authenticationData = {
    Username: 'endrit@butlerhospitality.com',
    Password: 'Butler1!',
};
const authenticationDetails =
    new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
const poolData = {
    UserPoolId: 'us-east-1_Tq29inz5l',
    ClientId: '7nn3c7l878r6t3vh4mh92ubpl2',
//cognito main  below
//      UserPoolId: 'us-east-1_dDFizHIJ4',
//      ClientId: 'vmqi4nhcg9osangi82u4bp9pl'
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const userData = {
    Username: 'endrit@butlerhospitality.com',
    Pool: userPool,
};
const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
        console.log({result})
        const accessToken = result.getAccessToken().getJwtToken();
        console.log('accestoken: ', accessToken);
    },

    onFailure: function(err) {
        console.log('err: ', err);
    },

});