import React, { useState } from 'react';
import { useAuth } from '@nhost/react-auth';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { 
    signIn, 
    signUp, 
    isAuthenticated, 
    auth, 
    verifyEmail, 
    resendVerificationEmail,
    getUser,
    getAuthStatus,
    getAuthError,
    getDeploymentStatus
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle');
  const [nhostError, setNhostError] = useState('');

  useEffect(() => {
    // Check Nhost initialization
    if (!auth) {
      console.error('Nhost auth client not initialized');
      setNhostError('Nhost authentication client not initialized');
    }

    // Check deployment status
    const checkDeployment = async () => {
      try {
        const deploymentStatus = await getDeploymentStatus();
        if (!deploymentStatus.deployed) {
          console.error('Project not deployed');
          setNhostError('Project not deployed. Please deploy your project in the Nhost dashboard');
        }
      } catch (error) {
        console.error('Failed to check deployment status:', error);
        setNhostError('Failed to check deployment status. Please check your project in the Nhost dashboard');
      }
    };

    // Check environment variables
    if (!process.env.REACT_APP_NHOST_SUBDOMAIN || !process.env.REACT_APP_NHOST_REGION) {
      console.error('Missing Nhost configuration');
      setNhostError('Missing Nhost configuration. Please check your .env file');
    }

    // Check deployment status after initialization
    checkDeployment();
  }, [auth]);

  useEffect(() => {
    // Listen for CAPTCHA token from parent window
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'RECAPTCHA_TOKEN') {
        setCaptchaToken(event.data.token);
        setCaptchaError('');
      }
    });

    // Check authentication status
    auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user);
      if (user) {
        console.log('User info:', getUser());
        if (user.isEmailVerified) {
          console.log('Email verified, navigating to chat');
          navigate('/');
        } else {
          console.log('Email not verified, showing verification prompt');
          setIsVerificationSent(true);
        }
      } else {
        console.log('No user logged in');
      }
    });

    // Check for authentication errors
    auth.onAuthError((error) => {
      console.error('Auth error:', error);
      setAuthError(error.message || 'Authentication failed');
    });

    // Check auth status periodically
    const checkAuthStatus = async () => {
      try {
        const status = await getAuthStatus();
        setAuthStatus(status);
        console.log('Current auth status:', status);
      } catch (err) {
        console.error('Error checking auth status:', err);
      }
    };

    const interval = setInterval(checkAuthStatus, 5000);
    checkAuthStatus(); // Initial check

    return () => {
      clearInterval(interval);
      window.removeEventListener('message', () => {});
    };
  }, [auth, navigate, getAuthStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');
    setAuthError('');
    setNhostError('');
    setIsLoading(true);

    try {
      if (!captchaToken) {
        throw new Error('Please complete the CAPTCHA verification');
      }

      if (isSignUp) {
        console.log('Attempting sign up with:', { email, password: '***', captcha: captchaToken });
        const result = await signUp({ 
          email, 
          password,
          captcha: captchaToken
        });
        console.log('Sign up result:', result);
        const user = auth.getUser();
        console.log('User after sign up:', user);
        
        if (user) {
          console.log('User ID:', user.id);
          console.log('Email Verified:', user.isEmailVerified);
          
          if (!user.isEmailVerified) {
            console.log('Sending verification email...');
            try {
              await verifyEmail();
              console.log('Verification email sent successfully');
              setIsVerificationSent(true);
              return;
            } catch (verifyErr) {
              console.error('Failed to send verification email:', verifyErr);
              setError('Failed to send verification email. Please try again.');
              throw verifyErr;
            }
          }
        }
      } else {
        console.log('Attempting sign in with:', { email, password: '***', captcha: captchaToken });
        try {
          const result = await signIn({ 
            email, 
            password,
            captcha: captchaToken
          });
          console.log('Sign in result:', result);
          const user = auth.getUser();
          console.log('User after sign in:', user);
          
          if (user) {
            console.log('User ID:', user.id);
            console.log('Email Verified:', user.isEmailVerified);
            
            if (!user.isEmailVerified) {
              console.log('User not verified, sending verification email...');
              try {
                await verifyEmail();
                console.log('Verification email sent successfully');
                setIsVerificationSent(true);
              } catch (verifyErr) {
                console.error('Failed to send verification email:', verifyErr);
                setError('Failed to send verification email. Please try again.');
                throw verifyErr;
              }
            } else {
              navigate('/');
            }
          }
        } catch (authErr) {
          console.error('Auth error:', authErr);
          if (authErr.message.includes('captcha')) {
            setCaptchaError('CAPTCHA verification failed');
          } else if (authErr.message.includes('password')) {
            setError('Invalid email or password');
          } else if (authErr.message.includes('email')) {
            setError('Email verification required');
          } else {
            setError(authErr.message || 'Authentication failed');
          }
          throw authErr;
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const errorMessage = err.message || 'An error occurred. Please try again.';
      console.error('Error details:', {
        status: authStatus,
        user: auth.getUser(),
        error: errorMessage
      });
      
      if (err.message.includes('captcha')) {
        setCaptchaError('CAPTCHA verification failed');
      } else if (err.message.includes('password')) {
        setError('Invalid email or password');
      } else if (err.message.includes('email')) {
        setError('Email verification required');
      } else {
        setError(errorMessage);
      }
      setNhostError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setError('Verification email sent again. Please check your inbox.');
    } catch (err) {
      console.error('Error resending verification:', err);
      setError('Failed to resend verification email. Please try again.');
    }
  };

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !captchaToken}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md ${
                isLoading || !captchaToken
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center mb-2">{error}</div>
          )}
          {captchaError && (
            <div className="text-red-500 text-sm text-center mb-2">{captchaError}</div>
          )}
          {authError && (
            <div className="text-red-500 text-sm text-center mb-2">{authError}</div>
          )}
          {nhostError && (
            <div className="text-red-500 text-sm text-center mb-2">
              Nhost Error: {nhostError}
            </div>
          )}
          {isVerificationSent && (
            <div className="text-blue-500 text-sm text-center mb-4">
              Please check your email for verification.{' '}
              <button
                onClick={handleResendVerification}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Resend verification email
              </button>
            </div>
          )}
          {authStatus !== 'idle' && (
            <div className="text-gray-600 text-sm text-center mb-2">
              Authentication status: {authStatus}
            </div>
          )}
          <div className="mt-4">
            <div className="h-60 w-full bg-gray-200 rounded-lg flex items-center justify-center">
              <div id="recaptcha-container" className="w-full h-full"></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
