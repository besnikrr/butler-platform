import ICognito from "../../interface";

const GetUser = (cognito: ICognito, logger: any) => {
  const action = async (username: string) => {
    try {
      // todo: this has to be transactional with saga since it can fail adding a user to a group
      const adminUser = await cognito.adminGetUser({
        Username: username
      });
      return adminUser.Username || null;
    } catch (err) {
      logger.error(JSON.stringify(err));
    }
  };

  return {
    action
  };
};

export { GetUser };
