// Environment configuration utility

export interface EnvironmentConfig {
  url: string;
  botName?: string;
  offerId: string;
}

export interface EnvConfigMap {
  local: EnvironmentConfig;
  dev: EnvironmentConfig;
}

/**
 * Get environment-specific configuration for LocaleCash testing
 * @param testEnv - Environment ('local' or 'dev')
 * @returns Environment configuration object
 */
export const getEnvironmentConfig = (testEnv: string = 'local'): EnvironmentConfig => {
  const envConfig: EnvConfigMap = {
    local: {
      url: process.env.LOCAL_LINK || 'https://escrow.test',
      botName: process.env.LOCAL_BOT_NAME || 'localecash_bot',
      offerId: process.env.OFFER_ID || 'cmb60r9x6000986pxaipl73ez'
    },
    dev: {
      url: process.env.DEV_LINK || 'https://dev.localecash.com',
      botName: process.env.DEV_BOT_NAME || 'local_ecash_dev_bot',
      offerId: process.env.DEV_OFFER_ID || 'cm8fqnd0c0006szoy4dm4tj7e'
    }
  };

  return envConfig[testEnv as keyof EnvConfigMap] || envConfig.local;
};
