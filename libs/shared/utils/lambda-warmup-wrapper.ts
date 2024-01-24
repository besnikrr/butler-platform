export const warmupkey = "serverless-plugin-warmup";
export const lambdaWarmupWrapper = (handler) => async (event) => {
  if (event.source === warmupkey) {
    return;
  }
  return handler(event);
};
