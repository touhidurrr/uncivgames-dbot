export const env: Partial<
  {
    BR_AUTH: string;
    DATA_API_ENDPOINT: string;
    DATA_API_KEY: string;
    PUBLIC_KEY: string;
    RANDOM_ORG_TOKEN: string;
  } & Env
> = {};

export const setEnv = (newEnv: typeof env) => Object.assign(env, newEnv);

export default { env, setEnv };
