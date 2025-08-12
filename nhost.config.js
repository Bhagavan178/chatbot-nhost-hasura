// Nhost Configuration
const nhostConfig = {
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
  region: process.env.REACT_APP_NHOST_REGION,
  auth: {
    captcha: {
      enabled: true,
      siteKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY
    }
  },
  storage: {
    enabled: true
  },
  graphql: {
    enabled: true
  }
};

export default nhostConfig;
