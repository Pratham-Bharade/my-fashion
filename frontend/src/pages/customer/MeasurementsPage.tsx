import React, { useState, useEffect } from 'react';
import { measurementsApi } from '../../api/measurements';
import { MeasurementProfile } from '../../types';
import { MeasurementForm } from '../../components/customer/MeasurementForm';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { Ruler, Plus, Edit2, Trash2, CheckCircle2, Star } from 'lucide-react';

export const MeasurementsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<MeasurementProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await measurementsApi.list();
      setProfiles(res.data);
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await measurementsApi.create(data);
      success('Measurement profile created successfully!');
      setIsCreateModalOpen(false);
      fetchProfiles();
    } catch (err: any) {
      toastError(err.message || 'Failed to save measurements.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingProfile) return;
    setIsSubmitting(true);
    try {
      await measurementsApi.update(editingProfile.id, data);
      success('Measurement profile updated successfully!');
      setEditingProfile(null);
      fetchProfiles();
    } catch (err: any) {
      toastError(err.message || 'Failed to update measurements.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await measurementsApi.setDefault(id);
      success('Default profile updated.');
      fetchProfiles();
    } catch (err: any) {
      toastError(err.message || 'Failed to set default profile.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this measurement profile?')) return;
    try {
      await measurementsApi.delete(id);
      success('Measurement profile deleted.');
      fetchProfiles();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete profile.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl text-stone-900">
            My Measurement Profiles
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Store your exact sizes for blouses, suits, kurtis, and lehengas. Used automatically when you book or order.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Profile
        </Button>
      </div>

      {/* Profiles List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState
          icon={<Ruler className="w-8 h-8" />}
          title="No Measurements Saved Yet"
          description="Create your first measurement profile so our master tailor can prepare patterns ahead of your fitting session."
          actionLabel="Create Measurement Profile"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all space-y-4 shadow-xs ${
                profile.is_default
                  ? 'border-brand-300 ring-2 ring-brand-100 bg-brand-50/10'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {/* Top Bar */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 font-bold text-[10px] uppercase tracking-wider">
                      {profile.garment_type}
                    </span>
                    {profile.is_default && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Default
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 mt-1">
                    {profile.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingProfile(profile)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Measurement Values Matrix Grid */}
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-100 text-xs">
                {Object.entries(profile.measurements || {}).map(([key, val]) => (
                  <div key={key} className="bg-white p-2 rounded-xl border border-stone-200/60">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tight block truncate">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-stone-900 text-sm">
                      {val}"
                    </span>
                  </div>
                ))}
              </div>

              {/* Set Default Action */}
              {!profile.is_default && (
                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => handleSetDefault(profile.id)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5" /> Make Default Profile
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="New Measurement Profile"
          subtitle="Enter your customized sizing dimensions"
          maxWidth="lg"
        >
          <MeasurementForm onSubmit={handleCreate} isLoading={isSubmitting} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingProfile && (
        <Modal
          isOpen={!!editingProfile}
          onClose={() => setEditingProfile(null)}
          title={`Edit ${editingProfile.name}`}
          subtitle="Update dimensions"
          maxWidth="lg"
        >
          <MeasurementForm
            initialData={editingProfile}
            onSubmit={handleUpdate}
            isLoading={isSubmitting}
          />
        </Modal>
      )}
    </div>
  );
};
