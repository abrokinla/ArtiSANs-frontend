'use client';

import { useState, useEffect } from 'react';
import { fetchStates, fetchLGAs } from '@/lib/api';

interface LocationValue {
  state_id: number | null;
  lga_id: number | null;
  state_name?: string;
  lga_name?: string;
}

interface LocationSelectProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  label?: string;
  required?: boolean;
  includeAddress?: boolean;
  addressValue?: string;
  onAddressChange?: (value: string) => void;
}

export default function LocationSelect({
  value,
  onChange,
  label = 'Location',
  required = false,
  includeAddress = false,
  addressValue = '',
  onAddressChange,
}: LocationSelectProps) {
  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [lgas, setLgas] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates()
      .then(setStates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (value.state_id) {
      setLoading(true);
      fetchLGAs(value.state_id)
        .then(setLgas)
        .catch(() => setLgas([]))
        .finally(() => setLoading(false));
    } else {
      setLgas([]);
    }
  }, [value.state_id]);

  const handleStateChange = (stateId: string) => {
    const id = stateId ? parseInt(stateId) : null;
    const state = states.find(s => s.id === id);
    onChange({
      state_id: id,
      lga_id: null,
      state_name: state?.name || '',
      lga_name: '',
    });
  };

  const handleLgaChange = (lgaId: string) => {
    const id = lgaId ? parseInt(lgaId) : null;
    const lga = lgas.find(l => l.id === id);
    onChange({
      ...value,
      lga_id: id,
      lga_name: lga?.name || '',
    });
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <select
            value={value.state_id || ''}
            onChange={(e) => handleStateChange(e.target.value)}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={value.lga_id || ''}
            onChange={(e) => handleLgaChange(e.target.value)}
            disabled={!value.state_id || loading}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {loading ? 'Loading...' : 'Select LGA'}
            </option>
            {lgas.map((lga) => (
              <option key={lga.id} value={lga.id}>
                {lga.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {includeAddress && onAddressChange && (
        <div>
          <input
            type="text"
            value={addressValue}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Street / Area (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
}

export type { LocationValue };
