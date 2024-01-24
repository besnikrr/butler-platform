const exemptURIs = {
	"/api/iam/users/reset/password": true,
	"/api/iam/users/init/reset/password": true
};
export const isExempt = (
  uri: string
) => {
  return exemptURIs[uri];
};
