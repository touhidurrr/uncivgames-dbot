export interface Env {
  BR_AUTH: string;
  DATA_API_ENDPOINT: string;
  DATA_API_KEY: string;
  PUBLIC_KEY: string;
  RANDOM_ORG_TOKEN: string;
  DATA_API_CLUSTER_NAME: string;
  DISCORD_TOKEN: string;
}
declare global {
  const env: Env;
}
