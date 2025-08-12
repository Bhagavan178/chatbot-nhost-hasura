import React, { useEffect } from 'react';

const Recaptcha = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Initialize reCAPTCHA
    window.grecaptcha.ready(() => {
      // Create an invisible reCAPTCHA
      window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, {
        action: 'submit'
      }).then(function(token) {
        // Store the token in the parent component
        if (window.parent) {
          window.parent.postMessage({
            type: 'RECAPTCHA_TOKEN',
            token
          }, '*');
        }
      });
    });

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default Recaptcha;
