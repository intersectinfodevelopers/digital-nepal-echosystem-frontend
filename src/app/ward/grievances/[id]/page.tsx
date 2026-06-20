'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import grievancesData from '../../../../../data/grievances.json';
import citizensData from '../../../../../data/citizens.json';

interface Grievance {
  id: string;
  tracking_code: string;
  citizen_id: string;
  category: string;
  status: string;
  filed_at: string;
  escalation_level?: string;
}

interface Activity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note: string;
  newStatus?: string;
}

export default function GrievanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const grievanceId = params.id as string;

  const [grievance, setGrievance] = useState<any>(null);
  const [citizen, setCitizen] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [referralReason, setReferralReason] = useState('');

  useEffect(() => {
    const foundGrievance = grievancesData.find((g: any) => g.id === grievanceId);
    if (foundGrievance) {
      setGrievance(foundGrievance);

      const foundCitizen = citizensData.find((c: any) => c.id === foundGrievance.citizen_id);
      setCitizen(foundCitizen);

      // Mock activity timeline
      setActivities([
        {
          id: "act-1",
          timestamp: foundGrievance.filed_at,
          actor: "Citizen",
          action: "Filed Grievance",
          note: "Initial submission"
        },
        {
          id: "act-2",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          actor: "Ward Admin",
          action: "Received",
          note: "Grievance acknowledged",
          newStatus: "IN_PROGRESS"
        }
      ]);
    } else {
      alert("Grievance not found");
      router.push('/grievances');
    }
  }, [grievanceId, router]);

  const updateStatus = (newStatus: string, note: string, actor = "Ward Admin") => {
    if (!grievance) return;

    const updatedGrievance = { ...grievance, status: newStatus };
    setGrievance(updatedGrievance);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action: `Status Updated`,
      note,
      newStatus
    };

    setActivities(prev => [newActivity, ...prev]);
    alert(`Grievance status updated to ${newStatus}`);
  };

  const daysElapsed = grievance ?
    Math.floor((new Date().getTime() - new Date(grievance.filed_at).getTime()) / (1000 * 3600 * 24)) : 0;

  if (!grievance || !citizen) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button onClick={() => router.push('/ward/grievances')} className="mb-6 text-blue-600 hover:underline flex items-center gap-2">
        ← Back to Grievances
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Grievance Detail</h1>
          <p className="font-mono text-xl text-gray-600 mt-1">{grievance.tracking_code}</p>
        </div>
        <span className={`px-5 py-2 rounded-full text-sm font-medium border ${getStatusBadge(grievance.status)}`}>
          {grievance.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6">Complainant Information</h2>
            <div className="grid grid-cols-2 gap-y-6">
              <div><p className="text-gray-500">Name</p><p className="font-medium">{citizen.name_en}</p></div>
              <div><p className="text-gray-500">Nepali Name</p><p>{citizen.name_np}</p></div>
              <div><p className="text-gray-500">Category</p><p className="capitalize">{grievance.category.replace('_', ' ').toLowerCase()}</p></div>
              <div><p className="text-gray-500">Filed On</p><p>{new Date(grievance.filed_at).toLocaleDateString('en-IN')}</p></div>
            </div>

            <div className="mt-8">
              <p className="text-gray-500 mb-2">Description</p>
              <p className="text-gray-700 leading-relaxed border-l-4 border-gray-200 pl-4">
                {grievance.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6">Activity Timeline</h2>
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{activity.actor}</p>
                      <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                    <p className="text-gray-700">{activity.note}</p>
                    {activity.newStatus && (
                      <p className="text-xs text-blue-600 mt-1">→ {activity.newStatus.replace('_', ' ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Ward Actions</h3>

            <button
              onClick={() => updateStatus('IN_PROGRESS', 'Started processing the grievance')}
              className="w-full mb-3 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700"
            >
              Mark as In Progress
            </button>

            <button
              onClick={() => {
                if (resolutionNote) {
                  updateStatus('RESOLVED_WARD', resolutionNote);
                  setResolutionNote('');
                } else alert("Please enter resolution note");
              }}
              className="w-full mb-3 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
            >
              Resolve at Ward Level
            </button>

            <div className="mt-6">
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Resolution details..."
                className="w-full border rounded-xl p-3 text-sm"
                rows={3}
              />
            </div>

            <button
              onClick={() => {
                if (referralReason) {
                  updateStatus('REFERRED_JUDICIAL', referralReason);
                  setReferralReason('');
                } else alert("Please provide referral reason");
              }}
              className="w-full mt-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
            >
              Refer to Judicial Committee
            </button>

            <textarea
              value={referralReason}
              onChange={(e) => setReferralReason(e.target.value)}
              placeholder="Reason for referral..."
              className="w-full border rounded-xl p-3 text-sm mt-3"
              rows={3}
            />
          </div>

          <div className="bg-white border rounded-2xl p-6 text-sm">
            <p className="text-gray-500">SLA Status</p>
            <p className={`text-xl font-semibold mt-1 ${daysElapsed > 7 ? 'text-red-600' : 'text-green-600'}`}>
              {daysElapsed} days elapsed
            </p>
            <p className="text-xs text-gray-500 mt-1">SLA Target: 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    RECEIVED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-amber-100 text-amber-800',
    RESOLVED_WARD: 'bg-green-100 text-green-800',
    REFERRED_JUDICIAL: 'bg-orange-100 text-orange-800',
    CLOSED: 'bg-gray-100 text-gray-600',
  };
  return styles[status] || 'bg-gray-100 text-gray-600';
}
