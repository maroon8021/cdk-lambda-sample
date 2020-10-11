/**
 * You need to create 'config.ts' with this type
 */
export type APIG_TYPE = {
  CERTIFICATE_ARN: string;
  DOMAIN_NAME_TOOL: string;
  DOMAIN_NAME_PLAYGROUND: string;
  HOSTED_ZONE_ID: string;
};

export type CONFIG_TYPE = {
  account: string;
  region: string;
};
