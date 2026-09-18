import { AtSign, Check, KeyRound, LockKeyhole, MapPin, Phone, Save, ShieldCheck, Sprout, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { changePassword, updateProfile } from '../../services/api';
import { FieldAssistantProfilePage } from '../fieldAssistant/FieldAssistantPage';
import LogisticsProfilePage from '../logistics/LogisticsProfilePage';

const demoProfileDefaults = {
    phone: '+91 98765 43210',
    address: 'Near Main Road, Guntur',
    village: 'Venkateswarapuram',
    mandal: 'Guntur',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    language: 'Telugu',
    bank_details: 'SBI - 1234 **** 5678',
};

export default function ProfilePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const stored = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const storedProfile = stored.profile_data || {};
    const currentRole = stored.role || 'consumer';
    const isFarmer = currentRole === 'farmer';
    const isDemoAccount = Boolean(stored.email?.endsWith('@farmdirect.ai'));
    const demoValue = (key) => isDemoAccount ? demoProfileDefaults[key] : '';
    const [profile, setProfile] = useState({
        full_name: stored.full_name || '',
        phone: stored.phone || demoValue('phone'),
        email: stored.email || '',
        address: storedProfile.address || demoValue('address'),
        village: storedProfile.village || demoValue('village'),
        mandal: storedProfile.mandal || demoValue('mandal'),
        district: storedProfile.district || demoValue('district'),
        state: storedProfile.state || demoValue('state'),
        language: storedProfile.language || demoValue('language'),
        bank_details: storedProfile.bank_details || demoValue('bank_details')
    });
    const [passwords, setPasswords] = useState({ current: '', next: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const initials = (profile.full_name || 'User').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    const profileFields = [
        { label: 'Phone', value: profile.phone, icon: Phone, key: 'phone', type: 'text' },
        { label: 'Email', value: profile.email, icon: AtSign, key: 'email', type: 'email' },
        { label: 'Address', value: profile.address, icon: MapPin, key: 'address', type: 'text' },
        { label: 'Village', value: profile.village, icon: UserRound, key: 'village', type: 'text' },
        { label: 'Mandal', value: profile.mandal, icon: UserRound, key: 'mandal', type: 'text' },
        { label: 'District', value: profile.district, icon: MapPin, key: 'district', type: 'text' },
        { label: 'State', value: profile.state, icon: ShieldCheck, key: 'state', type: 'text' },
        { label: 'Preferred Language', value: profile.language, icon: UserRound, key: 'language', type: 'text' },
        { label: 'Bank Details', value: profile.bank_details, icon: LockKeyhole, key: 'bank_details', type: 'text' },
    ];

    function updateProfileField(field, value) {
        setProfile((current) => ({ ...current, [field]: value }));
    }

    async function saveProfile(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            const payload = {
                full_name: profile.full_name,
                phone: profile.phone,
                email: profile.email,
                address: profile.address,
                village: profile.village,
                mandal: profile.mandal,
                district: profile.district,
                state: profile.state,
                language: profile.language,
                bank_details: profile.bank_details,
            };
            const result = await updateProfile(payload);
            const nextUser = {
                ...stored,
                ...result.user,
                profile_data: result.user.profile_data || payload,
                full_name: result.user.full_name || profile.full_name,
                phone: result.user.phone || profile.phone,
                email: result.user.email || profile.email,
            };
            localStorage.setItem('farmdirect_user', JSON.stringify(nextUser));
            setIsEditing(false);
            setMessage('Your account details are up to date.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save profile');
        }
    }

    async function savePassword(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            await changePassword(passwords.current, passwords.next);
            setPasswords({ current: '', next: '' });
            setMessage('Your password has been changed.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to change password');
        }
    }

    if (!localStorage.getItem('farmdirect_token')) {
        navigate('/login');
        return null;
    }

    if (currentRole === 'field_assistant') {
        return <FieldAssistantProfilePage />;
    }

    if (currentRole === 'logistics_provider') {
        return <LogisticsProfilePage />;
    }

    if (currentRole === 'bulk_buyer') {
        if (location.pathname === '/bulk-buyer/settings') {
            return <main className="bulk-buyer-profile-page bulk-buyer-settings-page"><div className="bulk-buyer-profile-container"><header className="bulk-buyer-profile-header"><div><span className="bulk-buyer-kicker"><ShieldCheck size={14}/> Account security</span><h1>Settings</h1><p>Manage password, security, and buying desk preferences.</p></div></header>{message && <p className="bulk-buyer-profile-message" role="status">{message}</p>}{error && <p className="bulk-buyer-profile-error" role="alert">{error}</p>}<div className="bulk-buyer-settings-grid"><section className="bulk-buyer-profile-card"><div className="bulk-buyer-profile-card-head"><div><span className="bulk-buyer-label">Security</span><h2>Change password</h2></div><LockKeyhole size={17}/></div><form onSubmit={savePassword} className="bulk-buyer-password-form"><label><span>Current password</span><input type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required/></label><label><span>New password</span><input type="password" minLength="8" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required/></label><button type="submit" className="bulk-buyer-profile-save"><ShieldCheck size={14}/> Update password</button></form></section><section className="bulk-buyer-profile-card"><div className="bulk-buyer-profile-card-head"><div><span className="bulk-buyer-label">Account status</span><h2>Workspace security</h2></div><ShieldCheck size={17}/></div><div className="bulk-buyer-security-status"><Check size={16}/><div><strong>Account verified</strong><p>Your buying desk is protected and ready for secure procurement.</p></div></div><div className="bulk-buyer-security-status"><Sprout size={16}/><div><strong>Growing Together</strong><p>Direct purchasing supports verified farm partners.</p></div></div></section></div></div></main>;
        }
        return <main className="bulk-buyer-profile-page"><div className="bulk-buyer-profile-container">
            <header className="bulk-buyer-profile-header"><div><span className="bulk-buyer-kicker"><UserRound size={14}/> Buying desk account</span><h1>Profile</h1><p>Manage your buying desk identity and delivery details.</p></div><button type="button" className="bulk-buyer-profile-edit" onClick={() => isEditing ? saveProfile({ preventDefault: () => undefined }) : setIsEditing(true)}>{isEditing ? <><Save size={15}/> Save changes</> : <><Check size={15}/> Edit profile</>}</button></header>
            {message && <p className="bulk-buyer-profile-message" role="status">{message}</p>}{error && <p className="bulk-buyer-profile-error" role="alert">{error}</p>}
            <section className="bulk-buyer-profile-identity"><div className="bulk-buyer-profile-avatar">{initials}</div><div><span className="bulk-buyer-label">Bulk buyer account</span><h2>{profile.full_name || 'Bulk Buyer'}</h2><p>{profile.email}</p></div><span className="bulk-buyer-profile-verified"><ShieldCheck size={14}/> Verified buyer</span></section>
            <div className="bulk-buyer-profile-grid"><section className="bulk-buyer-profile-card bulk-buyer-profile-card-wide"><div className="bulk-buyer-profile-card-head"><div><span className="bulk-buyer-label">Personal details</span><h2>Buying desk profile</h2></div><AtSign size={17}/></div><div className="bulk-buyer-profile-fields">{profileFields.slice(0, 3).map(({ label, value, icon: Icon, key, type }) => <label key={label}><span><Icon size={13}/> {label}</span>{isEditing ? <input type={type} value={profile[key]} onChange={(event) => updateProfileField(key, event.target.value)}/> : <strong>{value || 'Not provided'}</strong>}</label>)}</div></section><section className="bulk-buyer-profile-card"><div className="bulk-buyer-profile-card-head"><div><span className="bulk-buyer-label">Delivery details</span><h2>Primary location</h2></div><MapPin size={17}/></div><div className="bulk-buyer-profile-fields bulk-buyer-profile-fields-stack">{profileFields.slice(3, 8).map(({ label, value, icon: Icon, key, type }) => <label key={label}><span><Icon size={13}/> {label}</span>{isEditing ? <input type={type} value={profile[key]} onChange={(event) => updateProfileField(key, event.target.value)}/> : <strong>{value || 'Not provided'}</strong>}</label>)}</div></section><section className="bulk-buyer-profile-card bulk-buyer-security-card"><div className="bulk-buyer-profile-card-head"><div><span className="bulk-buyer-label">Security</span><h2>Change password</h2></div><LockKeyhole size={17}/></div><form onSubmit={savePassword} className="bulk-buyer-password-form"><label><span>Current password</span><input type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required/></label><label><span>New password</span><input type="password" minLength="8" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required/></label><button type="submit" className="bulk-buyer-profile-save"><ShieldCheck size={14}/> Update password</button></form></section><section className="bulk-buyer-profile-card bulk-buyer-security-card"><div className="bulk-buyer-profile-card-head"><div><span className="bulk-buyer-label">Account status</span><h2>Workspace security</h2></div><ShieldCheck size={17}/></div><div className="bulk-buyer-security-status"><Check size={16}/><div><strong>Account verified</strong><p>Your buying desk is protected and ready for secure procurement.</p></div></div><div className="bulk-buyer-security-status"><Sprout size={16}/><div><strong>Growing Together</strong><p>Direct purchasing supports verified farm partners.</p></div></div></section></div>
        </div></main>;
    }

    if (isFarmer) {
        return (
            <main className="farmer-profile-page">
                <div className="farmer-profile-container">
                    <section className="farmer-profile-hero">
                        <div className="farmer-profile-banner">
                            <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80" alt="Farm field" />
                        </div>
                        <div className="farmer-profile-identity-row">
                            <div className="farmer-profile-avatar-wrap">
                                <div className="farmer-profile-avatar">{initials}</div>
                            </div>
                            <div className="farmer-profile-intro">
                                <h1>{profile.full_name || 'User'}</h1>
                                <p>Account ID: {stored.id ? `FD${String(stored.id).padStart(6, '0')}` : 'Not assigned'}</p>
                            </div>
                            <button
                                className="farmer-profile-edit"
                                type="button"
                                onClick={() => isEditing ? saveProfile({ preventDefault: () => undefined }) : setIsEditing(true)}
                            >
                                {isEditing ? <><Save size={16} /> Save</> : <><Check size={16} /> Edit Profile</>}
                            </button>
                        </div>
                    </section>
                    <div className="farmer-profile-details-box">
                        <div className="farmer-profile-grid-row">
                            {profileFields.slice(0, 3).map(({ label, value, icon: Icon, key, type }) => (
                                <div key={label} className="farmer-profile-detail-item">
                                    <span className="farmer-profile-detail-icon"><Icon size={15} /></span>
                                    <div className="farmer-profile-detail-text">
                                        <label>{label}</label>
                                        {isEditing ? (
                                            <input
                                                className="farmer-profile-inline-input"
                                                type={type}
                                                value={profile[key]}
                                                onChange={(event) => updateProfileField(key, event.target.value)}
                                            />
                                        ) : (
                                            <strong>{value}</strong>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="farmer-profile-grid-row second-row">
                            {profileFields.slice(3, 6).map(({ label, value, icon: Icon, key, type }) => (
                                <div key={label} className="farmer-profile-detail-item">
                                    <span className="farmer-profile-detail-icon"><Icon size={15} /></span>
                                    <div className="farmer-profile-detail-text">
                                        <label>{label}</label>
                                        {isEditing ? (
                                            <input
                                                className="farmer-profile-inline-input"
                                                type={type}
                                                value={profile[key]}
                                                onChange={(event) => updateProfileField(key, event.target.value)}
                                            />
                                        ) : (
                                            <strong>{value}</strong>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="farmer-profile-grid-row third-row">
                            {profileFields.slice(6).map(({ label, value, icon: Icon, key, type }) => (
                                <div key={label} className="farmer-profile-detail-item">
                                    <span className="farmer-profile-detail-icon"><Icon size={15} /></span>
                                    <div className="farmer-profile-detail-text">
                                        <label>{label}</label>
                                        {isEditing ? (
                                            <input
                                                className="farmer-profile-inline-input"
                                                type={type}
                                                value={profile[key]}
                                                onChange={(event) => updateProfileField(key, event.target.value)}
                                            />
                                        ) : (
                                            <strong>{value}</strong>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="farmer-profile-edit-actions">
                                <button type="button" className="farmer-profile-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                                <button type="button" className="farmer-profile-save-inline" onClick={() => saveProfile({ preventDefault: () => undefined })}>Save changes</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="consumer-profile-page">
            <div className="consumer-profile-shell">
                <aside className="consumer-profile-sidebar">
                    <div className="consumer-profile-user-card">
                        <div className="consumer-profile-avatar">{initials}</div>
                        <div>
                            <strong>{profile.full_name || 'FarmDirect User'}</strong>
                            <span>{stored.role === 'bulk_buyer' ? 'Bulk Buyer' : 'Consumer'}</span>
                        </div>
                    </div>

                    <div className="consumer-profile-summary">
                        <div>
                            <span>Favorites</span>
                            <strong>12</strong>
                        </div>
                        <div>
                            <span>Orders</span>
                            <strong>08</strong>
                        </div>
                    </div>

                    <div className="consumer-profile-badges">
                        <span className="consumer-profile-badge"><Sprout size={12} /> Verified buyer</span>
                        <span className="consumer-profile-badge neutral"><ShieldCheck size={12} /> Secure account</span>
                    </div>
                </aside>

                <section className="consumer-profile-main">
                    <header className="consumer-profile-header">
                        <div>
                            <p className="consumer-profile-kicker">Profile</p>
                            <h1>{profile.full_name || 'FarmDirect User'}</h1>
                            <p>Keep your delivery details, payment info, and preferences up to date.</p>
                        </div>
                        <button
                            type="button"
                            className="consumer-profile-action"
                            onClick={() => isEditing ? saveProfile({ preventDefault: () => undefined }) : setIsEditing(true)}
                        >
                            {isEditing ? <><Save size={15} /> Save</> : <><Check size={15} /> Edit profile</>}
                        </button>
                    </header>

                    {message && <p className="consumer-profile-message" role="status">{message}</p>}
                    {error && <p className="consumer-profile-error" role="alert">{error}</p>}

                    <div className="consumer-profile-grid">
                        <div className="consumer-profile-card consumer-profile-card-wide">
                            <div className="consumer-profile-card-head">
                                <h2>Personal details</h2>
                                <span>Primary contact</span>
                            </div>
                            <div className="consumer-profile-field-grid">
                                {profileFields.slice(0, 3).map(({ label, value, icon: Icon, key, type }) => (
                                    <label key={label} className="consumer-profile-field">
                                        <span><Icon size={13} /> {label}</span>
                                        {isEditing ? (
                                            <input
                                                type={type}
                                                value={profile[key]}
                                                onChange={(event) => updateProfileField(key, event.target.value)}
                                            />
                                        ) : (
                                            <strong>{value}</strong>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="consumer-profile-card">
                            <div className="consumer-profile-card-head">
                                <h2>Address info</h2>
                                <span>Delivery</span>
                            </div>
                            <div className="consumer-profile-field-stack">
                                {profileFields.slice(3, 6).map(({ label, value, key, type }) => (
                                    <label key={label} className="consumer-profile-field compact">
                                        <span>{label}</span>
                                        {isEditing ? (
                                            <input
                                                type={type}
                                                value={profile[key]}
                                                onChange={(event) => updateProfileField(key, event.target.value)}
                                            />
                                        ) : (
                                            <strong>{value}</strong>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="consumer-profile-card">
                            <div className="consumer-profile-card-head">
                                <h2>Preferences</h2>
                                <span>Profile</span>
                            </div>
                            <div className="consumer-profile-field-stack">
                                {profileFields.slice(6).map(({ label, value, key, type }) => (
                                    <label key={label} className="consumer-profile-field compact">
                                        <span>{label}</span>
                                        {isEditing ? (
                                            <input
                                                type={type}
                                                value={profile[key]}
                                                onChange={(event) => updateProfileField(key, event.target.value)}
                                            />
                                        ) : (
                                            <strong>{value}</strong>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="consumer-profile-lower-grid">
                        <div className="consumer-profile-card">
                            <div className="consumer-profile-card-head">
                                <h2>Security</h2>
                                <span>Password</span>
                            </div>
                            <form className="consumer-profile-password-form" onSubmit={savePassword}>
                                <label className="consumer-profile-field compact">
                                    <span><KeyRound size={12} /> Current password</span>
                                    <input
                                        type="password"
                                        value={passwords.current}
                                        onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))}
                                        placeholder="Enter current password"
                                    />
                                </label>
                                <label className="consumer-profile-field compact">
                                    <span><LockKeyhole size={12} /> New password</span>
                                    <input
                                        type="password"
                                        value={passwords.next}
                                        onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))}
                                        placeholder="Enter new password"
                                    />
                                </label>
                                <button type="submit" className="consumer-profile-secondary-action">Update password</button>
                            </form>
                        </div>

                        <div className="consumer-profile-card consumer-profile-card-highlight">
                            <div className="consumer-profile-card-head">
                                <h2>Account status</h2>
                                <span>Verified</span>
                            </div>
                            <div className="consumer-profile-status-panel">
                                <div>
                                    <strong>Verified account</strong>
                                    <p>Your profile is active and ready for farm purchases.</p>
                                </div>
                                <div className="consumer-profile-status-badge">Active</div>
                            </div>
                            {isEditing && (
                                <div className="consumer-profile-row-actions">
                                    <button type="button" className="consumer-profile-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button type="button" className="consumer-profile-save-inline" onClick={() => saveProfile({ preventDefault: () => undefined })}>Save changes</button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}