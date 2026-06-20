'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import idCardsData from '../../../../data/id-cards.json';
import citizensData from '../../../../data/citizens.json';

interface IdCard {
  id: string;
  citizen_id: string;
  card_type: string;
  status: string;
  qr_hash: string;
  issued_at: string | null;
  expires_at: string | null;
  collected_at: string | null;
}

interface Citizen {
  id: string;
  name_en: string;
  name_np: string;
  nid_masked: string;
  sex: string;
  dob: string;
  tole: string;
}

export default function QrVerifyPage() {
  const params = useParams();
  const qrHash = params.qr_hash as string;

  const [card, setCard] = useState<IdCard | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundCard = idCardsData.find((c: any) => c.qr_hash === qrHash) as IdCard | undefined;

    if (foundCard) {
      setCard(foundCard);

      const foundCitizen = citizensData.find((c: any) => c.id === foundCard.citizen_id) as Citizen | undefined;
      setCitizen(foundCitizen || null);

      // Validity check
      const isExpired = foundCard.expires_at
        ? new Date(foundCard.expires_at) < new Date()
        : false;

      const isValidCard =
        foundCard.status === 'APPROVED' ||
        foundCard.status === 'COLLECTED' &&
        !isExpired;

      setIsValid(isValidCard);
    }

    setLoading(false);
  }, [qrHash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Verifying QR Code...</p>
      </div>
    );
  }

  if (!card || !citizen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600">Invalid QR Code</h1>
          <p className="text-gray-600 mt-2">This QR code is not associated with any valid ID card.</p>
        </div>
      </div>
    );
  }

  const isExpired = card.expires_at ? new Date(card.expires_at) < new Date() : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
              <span className="text-4xl">🪪</span>
            </div>
            <h1 className="text-2xl font-bold">Ward ID Card Verification</h1>
            <p className="text-blue-100 mt-1">Official Government Verification</p>
          </div>

          {/* Status */}
          <div className="p-8 text-center border-b">
            {isValid && !isExpired ? (
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-2 rounded-full font-medium">
                <span className="text-xl">✅</span>
                VALID ID CARD
              </div>
            ) : isExpired ? (
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-6 py-2 rounded-full font-medium">
                <span className="text-xl">⏰</span>
                EXPIRED
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-6 py-2 rounded-full font-medium">
                NOT YET APPROVED
              </div>
            )}
          </div>

          {/* Card Information */}
          <div className="p-8 space-y-6">
            <div>
              <p className="text-gray-500 text-sm">Card Holder</p>
              <p className="text-2xl font-semibold">{citizen.name_en}</p>
              <p className="text-xl text-gray-600">{citizen.name_np}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm">Card Type</p>
                <p className="font-medium">{card.card_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">NID Number</p>
                <p className="font-mono">{citizen.nid_masked}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Issued Date</p>
                <p>{card.issued_at ? new Date(card.issued_at).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Expiry Date</p>
                <p className={isExpired ? 'text-red-600' : ''}>
                  {card.expires_at ? new Date(card.expires_at).toLocaleDateString('en-IN') : '—'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Tole / Location</p>
              <p>{citizen.tole}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-gray-500 text-sm mb-1">QR Hash</p>
              <p className="font-mono text-sm text-gray-600 break-all">{card.qr_hash}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center text-xs text-gray-500 border-t">
            This card was verified on {new Date().toLocaleDateString('en-IN')} at{' '}
            {new Date().toLocaleTimeString('en-IN')}
            <br />
            Government of Nepal • Ward Digital Service
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Powered by Ward Management System
        </p>
      </div>
    </div>
  );
}
