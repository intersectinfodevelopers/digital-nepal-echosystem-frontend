'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import grievancesData from '../../../../../data/grievances.json';

export default function PublicGrievanceTracking() {
  const params = useParams();
  const trackingCode = params.code as string;

  const [grievance, setGrievance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = grievancesData.find((g: any) => g.tracking_code === trackingCode);
    setGrievance(found);
    setLoading(false);
  }, [trackingCode]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Verifying...</div>;

  if (!grievance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Not Found</h1>
          <p className="text-gray-600 mt-2">Invalid tracking code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-blue-700 text-white p-8 text-center">
          <h1 className="text-2xl font-bold">Grievance Tracking</h1>
          <p className="text-blue-200 mt-1">Government of Nepal • Ward System</p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500">Tracking Code</p>
            <p className="font-mono text-2xl font-bold text-gray-800 tracking-widest">{grievance.tracking_code}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500">Current Status</p>
            <p className="text-3xl font-semibold mt-2 text-blue-700">
              {grievance.status.replace('_', ' ')}
            </p>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600">
            Last Updated: {new Date(grievance.filed_at).toLocaleDateString('en-IN')}
          </div>
        </div>

        <div className="border-t p-6 text-center text-xs text-gray-500">
          This is an official public tracking page.<br />
          For more details, visit your ward office.
        </div>
      </div>
    </div>
  );
}
