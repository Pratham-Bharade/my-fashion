import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Lock, Mail, ArrowRight, UserCheck, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const message = searchParams.get('msg') || searchParams.get('message');
  const isAdminLogin = redirect.startsWith('/admin') || searchParams.get('role') === 'admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strictly enforce empty inputs on mount and route change (blocks browser autofill)
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError(null);
  }, [location.pathname, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.login({
        email: email.trim(),
        password,
      });

      const tokenData = res.data;
      localStorage.setItem('token', tokenData.access_token);
      const meRes = await authApi.getMe();
      login(tokenData.access_token, meRes.data);

      success(`Welcome back, ${tokenData.name}!`);

      if (tokenData.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-8 px-4 sm:px-6 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center space-y-2">
        <img
          src="/logo.png"
          alt="Vandana Creations"
          className="h-20 sm:h-24 w-auto object-contain mx-auto"
        />
        <div className="flex items-center justify-center gap-2">
          {isAdminLogin && <Shield className="w-5 h-5 text-amber-500" />}
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-black dark:text-white">
            {isAdminLogin ? 'Admin Studio Sign In' : 'Customer Sign In'}
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {isAdminLogin
            ? 'Enter your administrative credentials to manage the boutique atelier.'
            : 'Access your measurements, bookings & order progress.'}
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white dark:bg-stone-900 py-6 px-5 sm:px-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
          
          {/* Friendly Customer Banner if Redirected */}
          {message ? (
            <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-black dark:text-white shrink-0" />
              <span>{message}</span>
            </div>
          ) : null}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
            <Input
              label="Email Address"
              type="email"
              name="boutique_user_email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-stone-500" />}
              autoComplete="off"
              required
            />

            <Input
              label="Password"
              type="password"
              name="boutique_user_password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-stone-500" />}
              autoComplete="new-password"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-400">
                <input type="checkbox" defaultChecked className="rounded text-black dark:text-white" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-semibold text-black dark:text-white hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="md" fullWidth isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign in
            </Button>
          </form>

          {/* Register Link */}
          {!isAdminLogin && (
            <div className="pt-1 text-center text-xs text-stone-500 dark:text-stone-400">
              Don't have an account?{' '}
              <Link to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-bold text-black dark:text-white hover:underline">
                Create customer account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
