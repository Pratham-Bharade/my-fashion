import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { Service } from '../../types';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Scissors } from 'lucide-react';

const PRESET_LABELS: Record<string, string> = {
  ALL: 'All Services',
  BLOUSE: 'Blouse Stitching',
  TRADITIONAL: 'Sarees & Lehengas',
  KURTIS: 'Kurtis',
  DRESSES: 'Gowns & Dresses',
  ALTERATIONS: 'Alterations',
  BRIDAL: 'Bridal Couture',
  LEHENGA: 'Lehenga Choli',
  SUITS: 'Salwar Suits',
  ANARKALI: 'Anarkali Suits',
  WESTERN: 'Western & Gowns',
  DUPATTA: 'Dupattas & Veils',
};

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get('category') || 'ALL').toUpperCase();

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all active services
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await servicesApi.list();
      setAllServices(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Compute dynamic category tabs from all database services
  const categories = useMemo(() => {
    const dbCats = allServices.map((s) => s.category.toUpperCase().trim()).filter(Boolean);
    const unique = Array.from(new Set(['ALL', ...dbCats]));

    return unique.map((key) => ({
      key,
      label: PRESET_LABELS[key] || (key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, ' ')),
    }));
  }, [allServices]);

  // Filter services instantly by activeCategory
  const displayedServices = useMemo(() => {
    if (activeCategory === 'ALL') return allServices;
    return allServices.filter((s) => s.category.toUpperCase().trim() === activeCategory);
  }, [allServices, activeCategory]);

  const handleCategorySelect = (catKey: string) => {
    if (catKey === 'ALL') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catKey });
    }
  };

  return (
    <div className="space-y-6 pb-12 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Header */}
      <section className="pt-8 pb-2 text-center max-w-xl mx-auto px-4 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          Catalog
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-black dark:text-white">
          Tailoring Services
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Bespoke stitching with pre-washed lining, reinforced seams, and perfect fit.
        </p>
      </section>

      {/* Category Pills - Automatically Shows Any New Category */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategorySelect(cat.key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : displayedServices.length === 0 ? (
          <EmptyState
            icon={<Scissors className="w-6 h-6 text-black dark:text-white" />}
            title="No Services Found"
            description="No tailoring services in this category."
            actionLabel="All Services"
            onAction={() => handleCategorySelect('ALL')}
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {displayedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
