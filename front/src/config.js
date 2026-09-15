import { ENV_CONFIG } from './config/environment';

// Configuration de l'application (compatibilité descendante)
export const config = {
  DEV_MODE: ENV_CONFIG.DEV_MODE,
  APP_NAME: ENV_CONFIG.APP_NAME,
  VERSION: ENV_CONFIG.APP_VERSION,
  API_URL: ENV_CONFIG.API_URL,
};

export default config;
