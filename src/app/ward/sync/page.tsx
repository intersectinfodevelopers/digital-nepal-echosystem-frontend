'use client';

import { useState } from 'react';
import syncBatchesData from '../../../../data/sync-batches.json';

interface SyncBatch {
  batch_id: string;
  ward_id: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'PENDING';
  record_count: number;
  conflict_count: number;
  submitted_at: string;
  completed_at: string | null;
}

interface BatchRecord {
  record_id: string;
  citizen_name: string;
  sync_status: 'synced' | 'pending' | 'conflict' | 'failed';
  error?: string;
}

export default function SyncStatusPage() {
  const [syncBatches] = useState<SyncBatch[]>(syncBatchesData as SyncBatch[]);
  const [selectedBatch, setSelectedBatch] = useState<SyncBatch | null>(null);
  const [batchRecords, setBatchRecords] = useState<BatchRecord[]>([]);

  // Dashboard Stats (Mock Data)
  const totalSyncedToday = 156;
  const pendingUpload = 34;
  const conflictsDetected = 12;
  const failedRecords = 5;

  const hasConflicts = conflictsDetected > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Open Batch Detail (Mock records)
  const openBatchDetail = (batch: SyncBatch) => {
    setSelectedBatch(batch);

    // Mock detailed records for the selected batch
    const mockRecords: BatchRecord[] = [
      { record_id: "cit-001", citizen_name: "Ram Bahadur Thapa", sync_status: "synced" },
      { record_id: "cit-003", citizen_name: "Krishna Prasad Adhikari", sync_status: "synced" },
      { record_id: "cit-005", citizen_name: "Hari Bahadur Karki", sync_status: "conflict", error: "Duplicate NID found" },
      { record_id: "cit-008", citizen_name: "Gita Devi Rai", sync_status: "failed", error: "Connection timeout" },
      { record_id: "cit-012", citizen_name: "Sita Thapa", sync_status: "pending" },
    ];
    setBatchRecords(mockRecords);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Offline Sync Status</h1>
        <p className="text-gray-500 mt-1">Ward data synchronization across devices</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-sm text-gray-500">Synced Today</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{totalSyncedToday}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-sm text-gray-500">Pending Upload</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">{pendingUpload}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-sm text-gray-500">Conflicts Detected</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{conflictsDetected}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-sm text-gray-500">Failed Records</p>
          <p className="text-4xl font-bold text-red-600 mt-2">{failedRecords}</p>
        </div>
      </div>

      {/* Conflict Alert Banner */}
      {hasConflicts && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold text-lg">⚠️ Conflicts Detected</h3>
            <p className="text-red-700 mt-1">
              Some records failed to sync due to conflicts. These must be resolved by the Local Body Administrator.
            </p>
          </div>
          <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium whitespace-nowrap">
            View Conflict Report
          </button>
        </div>
      )}

      {/* Sync Batch History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Sync Batch History</h2>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-left font-medium text-gray-600">Batch ID</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Ward ID</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Submitted At</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Completed At</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Records</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Conflicts</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Status</th>
                <th className="px-6 py-4 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {syncBatches.map((batch) => (
                <tr key={batch.batch_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-mono text-sm text-gray-600 font-medium">{batch.batch_id}</td>
                  <td className="px-6 py-5 text-gray-600">{batch.ward_id}</td>
                  <td className="px-6 py-5 text-gray-600">
                    {formatDateTime(batch.submitted_at)}
                  </td>
                  <td className="px-6 py-5 text-gray-600">
                    {batch.completed_at ? formatDateTime(batch.completed_at) : '—'}
                  </td>
                  <td className="px-6 py-5 text-gray-600 font-medium">{batch.record_count}</td>
                  <td className="px-6 py-5 font-medium text-red-600">
                    {batch.conflict_count}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-4 py-1 text-xs font-medium rounded-full border ${getStatusBadge(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => openBatchDetail(batch)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="p-8 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Sync Batch Details</h2>
                <p className="font-mono text-gray-600 mt-1">{selectedBatch.batch_id}</p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-3xl text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-4">Record ID</th>
                    <th className="text-left py-4 px-4">Citizen Name</th>
                    <th className="text-left py-4 px-4">Sync Status</th>
                    <th className="text-left py-4 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {batchRecords.map((record) => (
                    <tr key={record.record_id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-mono text-sm">{record.record_id}</td>
                      <td className="py-4 px-4 font-medium">{record.citizen_name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1 text-xs font-medium rounded-full
                          ${record.sync_status === 'synced' ? 'bg-green-100 text-green-700' : ''}
                          ${record.sync_status === 'conflict' ? 'bg-red-100 text-red-700' : ''}
                          ${record.sync_status === 'failed' ? 'bg-orange-100 text-orange-700' : ''}
                          ${record.sync_status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                        `}>
                          {record.sync_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {record.error || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50 border-t rounded-b-3xl text-sm text-gray-600">
              <strong>Note:</strong> Conflicts must be resolved by your Local Body Administrator.
              Please contact them with the batch reference number for resolution.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
