import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { User, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [city, setCity] = useState(user?.profile?.city || '');
  const [pincode, setPincode] = useState(user?.profile?.pincode || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      });
      await refreshUser();
      success('Your profile details have been updated.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-12">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          My Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Manage your personal contact details and delivery address.
        </p>
      </div>

      {/* Personal Info & Address */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-6">
        <h2 className="font-serif font-bold text-lg text-black dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-black dark:text-white" />
          Personal Details & Delivery Address
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address (Login ID)"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed directly."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="City"
              value={city}
              placeholder="e.g. Pune"
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Full Delivery Address"
                value={address}
                placeholder="Flat / Building, Street, Landmark"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <Input
              label="Pincode"
              value={pincode}
              placeholder="411001"
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdating}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
