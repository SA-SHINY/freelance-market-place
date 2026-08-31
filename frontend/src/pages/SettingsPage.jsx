import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [profile, setProfile] = useState({
    name: '', bio: '', location: '', phone: '',
    skills: [], hourlyRate: '', availability: 'available', category: '',
    company: '', website: '', emailNotifications: true,
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '', bio: user.bio || '', location: user.location || '', phone: user.phone || '',
        skills: user.skills || [], hourlyRate: user.hourlyRate || '', availability: user.availability || 'available',
        category: user.category || '', company: user.company || '', website: user.website || '',
        emailNotifications: user.emailNotifications ?? true,
      });
    }
  }, [user]);

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setProfile((p) => ({ ...p, skills: [...new Set([...p.skills, skillInput.trim()])] }));
      setSkillInput('');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...profile, hourlyRate: profile.hourlyRate ? Number(profile.hourlyRate) : undefined };
      const { data } = await api.put('/users/profile', payload);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords don't match");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    setPasswordSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Settings</h1>
      <p className="text-ink-500 mb-7">Manage your profile and account security.</p>

      <div className="flex gap-1 border-b border-ink-100 mb-7">
        {['profile', 'password'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="card p-6 space-y-5">
          <div className="flex items-center gap-4 pb-2">
            <div className="w-16 h-16 rounded-full bg-ink-900 text-paper flex items-center justify-center text-2xl font-semibold overflow-hidden shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>
            <div>
              <label className="btn-secondary text-xs cursor-pointer">
                Choose profile photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error('Image must be under 2MB');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => setProfile({ ...profile, avatar: ev.target.result });
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Full name</label>
            <input className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Bio</label>
            <textarea rows={4} maxLength={500} className="input-field" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell people a bit about yourself" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">Location</label>
              <input className="input-field" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">Phone</label>
              <input className="input-field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
          </div>

          {user.role === 'freelancer' ? (
            <>
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Skills</label>
                <input className="input-field" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill and press Enter" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="badge bg-ink-100 text-ink-600 gap-1">
                      {s}
                      <button type="button" onClick={() => setProfile((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }))}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">Hourly rate (USD)</label>
                  <input type="number" className="input-field" value={profile.hourlyRate} onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-700 block mb-1.5">Availability</label>
                  <select className="input-field" value={profile.availability} onChange={(e) => setProfile({ ...profile, availability: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Company</label>
                <input className="input-field" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Website</label>
                <input className="input-field" value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} placeholder="https://" />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input type="checkbox" checked={profile.emailNotifications} onChange={(e) => setProfile({ ...profile, emailNotifications: e.target.checked })} className="w-4 h-4" />
            Email me about new activity
          </label>

          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handleChangePassword} className="card p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Current password</label>
            <input type="password" required className="input-field" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">New password</label>
            <input type="password" required minLength={6} className="input-field" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Confirm new password</label>
            <input type="password" required className="input-field" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
          </div>
          <button type="submit" disabled={passwordSaving} className="btn-primary w-full">{passwordSaving ? 'Updating…' : 'Change password'}</button>
        </form>
      )}
    </div>
  );
};

export default SettingsPage;
