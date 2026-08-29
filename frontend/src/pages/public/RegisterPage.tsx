import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { User, Mail, Phone, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const message = searchParams.get('msg') || searchParams.get('message');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirm_password: confirmPassword,
      });

      const tokenData = res.data;
      localStorage.setItem('token', tokenData.access_token);
      const meRes = await authApi.getMe();
      login(tokenData.access_token, meRes.data);

      success('Welcome to Vandana Creations! Your account is ready.');
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-8 px-4 sm:px-6 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center space-y-2">
        <img
          src="/logo.png"
          alt="Vandana Creations"
          className="h-20 sm:h-24 w-auto object-contain mx-auto"
        />
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-black">
          Create Account
        </h2>
        <p className="text-xs text-stone-500">
          Save your sizes, book trials & track custom stitching.
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-6 px-5 sm:px-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          
          {/* 1-Line Banner if Redirected */}
          {message && (
            <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-300 text-black text-xs font-medium flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Full Name"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-stone-600" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-stone-600" />}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-stone-600" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-stone-600" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-stone-600" />}
              required
            />

            <Button type="submit" variant="primary" size="md" fullWidth isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Account
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-bold text-black hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
