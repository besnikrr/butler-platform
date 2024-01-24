import { ActionURI } from "../types";

export const validateLocal = async (
  permissions: any, actionUriObj: ActionURI) => {
  const uris: any = [];
  permissions.forEach((permission: any) => {
    const permissionSplit = permission.arn.split(":");
    const lastKey = permissionSplit[permissionSplit.length - 1];
    const uri = lastKey.split("/").slice(3, lastKey.length).join("/");
    const action = lastKey.split("/").slice(2, lastKey.length)[0];

    if (action === actionUriObj.action) {
      uris.push({
        uri: `/${uri}`,
        action: action
      });
    }
  });

  const allowedPermissions: Array<boolean> = [];
  uris.forEach((arnUri: any) => {
    allowedPermissions.push(
      compareUris(
        arnUri.uri.substring(1).split("/"),
        actionUriObj.uri.substring(1).split("/")
      )
    );
  });

  if (!allowedPermissions.includes(true)) {
    throw new Error("Permission denied");
  }
};

const compareUris = (arnUri: Array<string>, uriB: Array<string>) => {
  let cnt = 0;
  if (arnUri.length !== uriB.length && arnUri.length !== 0) {
    return false;
  }
  for (let i = 0; i < arnUri.length; i++) {
    if (arnUri[i] === "*") {
      cnt++;
      continue;
    }
    if (arnUri[i] === uriB[i]) {
      cnt++;
    }
  }
  return cnt === arnUri.length;
};
