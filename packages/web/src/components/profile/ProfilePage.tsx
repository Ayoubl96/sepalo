'use client';

import { useProfile } from '@/hooks/useProfile';
import { ProfileForm } from './ProfileForm';

export function ProfilePage() {
  const { profile, loading, saveProfile } = useProfile();

  return (
    <div className="px-8 py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Profile</h1>
      <p className="mt-1 mb-8 text-sm text-muted">
        Your company details used as debtor in every generated XML file.
      </p>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <ProfileForm defaultValues={profile} onSave={saveProfile} />
      )}
    </div>
  );
}
