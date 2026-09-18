import { ArrowLeft, ArrowRight, ArrowUpRight, AtSign, BarChart3, Bell, Check, CheckCircle2, ChevronRight, CircleAlert, ClipboardList, Clock3, CreditCard, Edit3, Eye, Globe2, ImagePlus, IndianRupee, Info, KeyRound, LoaderCircle, LockKeyhole, MapPin, Moon, PackageOpen, Phone, Plus, RefreshCw, Save, Search, Settings2, ShieldCheck, ShoppingBag, SlidersHorizontal, Sun, Truck, UserPlus, Users, UserRound, Wallet, Wheat, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { changePassword, createFieldAssistantProduct, createPartnerRecord, getDemandForecast, getFieldAssistantProducts, getFieldAssistantSales, getNotifications, getOrders, getPartnerRecords, getProducts, markNotificationRead, registerFieldFarmer, updateFieldAssistantProduct, updateOrderStatus, updateProfile, uploadFieldAssistantProductImage } from '../../services/api';
import { getProductImage } from '../../utils/productImages';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function FieldAssistantSettingsPage() {
    const navigate = useNavigate();
    const stored = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const profileData = stored.profile_data || {};
    const [name, setName] = useState(stored.full_name || '');
    const [language, setLanguage] = useState(profileData.language || 'English');
    const [notifications, setNotifications] = useState(profileData.notifications_enabled !== false);
    const [locationTracking, setLocationTracking] = useState(profileData.location_tracking !== false);
    const [appearance, setAppearance] = useState(localStorage.getItem('field_assistant_appearance') || 'light');
    const [passwords, setPasswords] = useState({ current: '', next: '' });
    const [state, setState] = useState({ saving: false, error: '', message: '' });
    async function saveSettings(event) { event.preventDefault(); setState({ saving: true, error: '', message: '' }); try { const result = await updateProfile({ full_name: name, language, notifications_enabled: notifications, location_tracking: locationTracking }); localStorage.setItem('farmdirect_user', JSON.stringify({ ...stored, ...result.user })); localStorage.setItem('field_assistant_appearance', appearance); setState({ saving: false, error: '', message: 'Settings saved successfully.' }); } catch (requestError) { setState({ saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to save settings', message: '' }); } }
    async function savePassword(event) { event.preventDefault(); setState({ saving: true, error: '', message: '' }); try { await changePassword(passwords.current, passwords.next); setPasswords({ current: '', next: '' }); setState({ saving: false, error: '', message: 'Password changed successfully.' }); } catch (requestError) { setState({ saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to change password', message: '' }); } }
    return <main className={`field-assistant-page field-assistant-settings-page ${appearance === 'dark' ? 'is-dark' : ''}`}><div className="field-assistant-container"><header className="field-assistant-topline"><span><Settings2 size={13}/> Field Assistant / Settings</span><span>Preferences and account</span></header><section className="field-assistant-heading"><div><p className="field-assistant-kicker">Workspace preferences</p><h1>Settings</h1><p>Manage your preferences and account settings.</p></div><button type="button" className="field-assistant-back-button" onClick={() => navigate('/dashboard/field-assistant')}><ArrowLeft size={15}/> Dashboard</button></section>{state.message && <p className="field-assistant-success" role="status"><Check size={15}/>{state.message}</p>}{state.error && <p className="field-assistant-form-error" role="alert">{state.error}</p>}<div className="field-assistant-settings-layout"><form className="field-assistant-settings-card" onSubmit={saveSettings}><div className="field-assistant-settings-card-head"><div><span className="field-assistant-panel-label">Account Settings</span><h2>Account settings</h2></div><span className="field-assistant-settings-badge"><i/> Active</span></div><div className="field-assistant-settings-list"><label className="field-assistant-settings-row"><span className="field-assistant-settings-icon"><UserRound size={16}/></span><span><strong>Profile Information</strong><small>Manage your personal information</small></span><input className="field-assistant-settings-name" value={name} onChange={(event) => setName(event.target.value)} aria-label="Profile name"/></label><div className="field-assistant-settings-row"><span className="field-assistant-settings-icon"><Bell size={16}/></span><span><strong>Notification Preferences</strong><small>Receive updates about orders and farmers</small></span><button type="button" className={`field-assistant-settings-toggle ${notifications ? 'is-on' : ''}`} onClick={() => setNotifications((current) => !current)} aria-label="Toggle notification preferences"><i/></button></div><div className="field-assistant-settings-row"><span className="field-assistant-settings-icon"><LockKeyhole size={16}/></span><span><strong>Security</strong><small>Change your account password</small></span><button type="button" className="field-assistant-settings-row-action" onClick={() => document.getElementById('field-assistant-password')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Open security settings"><ChevronRight size={16}/></button></div><label className="field-assistant-settings-row"><span className="field-assistant-settings-icon"><Globe2 size={16}/></span><span><strong>Language Preferences</strong><small>Choose your preferred language</small></span><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Language preferences"><option>English</option><option>Telugu</option><option>Hindi</option><option>Kannada</option></select></label><div className="field-assistant-settings-row"><span className="field-assistant-settings-icon"><MapPin size={16}/></span><span><strong>Location Tracking</strong><small>Help coordinate farmer visits and routes</small></span><button type="button" className={`field-assistant-settings-toggle ${locationTracking ? 'is-on' : ''}`} onClick={() => setLocationTracking((current) => !current)} aria-label="Toggle location tracking"><i/></button></div></div><div className="field-assistant-settings-section-label">Appearance</div><div className="field-assistant-appearance"><button type="button" className={appearance === 'light' ? 'is-active' : ''} onClick={() => setAppearance('light')}><Sun size={15}/> Light</button><button type="button" className={appearance === 'dark' ? 'is-active' : ''} onClick={() => setAppearance('dark')}><Moon size={15}/> Dark</button></div><button type="submit" className="field-assistant-primary-button field-assistant-settings-save" disabled={state.saving}>{state.saving ? <LoaderCircle size={15} className="field-assistant-spin"/> : <Save size={15}/>} {state.saving ? 'Saving...' : 'Save Changes'}</button></form><aside className="field-assistant-settings-side"><div className="field-assistant-settings-side-visual"><Settings2 size={29}/><strong>Field Assistant tools</strong><p>Keep your workspace tuned to the way you support farmers.</p></div><form id="field-assistant-password" className="field-assistant-password-card" onSubmit={savePassword}><span className="field-assistant-panel-label">Security</span><h2>Change password</h2><label>Current password<input type="password" value={passwords.current} onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} minLength="8" required/></label><label>New password<input type="password" value={passwords.next} onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} minLength="8" required/></label><button type="submit" className="field-assistant-secondary-button" disabled={state.saving}><KeyRound size={14}/> Update password</button></form></aside></div></div></main>;
}

function FieldAssistantSalesPage() {
    const demoSummary = { revenue: 48250, paid_orders: 48, pending_amount: 11450, completed_revenue: 36800, revenue_by_crop: [{ crop: 'Tomato', amount: 17250 }, { crop: 'Chili', amount: 11520 }, { crop: 'Rice', amount: 8640 }, { crop: 'Onion', amount: 5760 }, { crop: 'Others', amount: 5080 }], monthly_revenue: [{ month: 'May', amount: 5800 }, { month: 'Jun', amount: 8200 }, { month: 'Jul', amount: 7600 }, { month: 'Aug', amount: 12200 }, { month: 'Sep', amount: 14450 }], history: [] };
    const [summary, setSummary] = useState(demoSummary);
    const [state, setState] = useState({ loading: true, error: '', message: '' });
    async function load() { setState((current) => ({ ...current, loading: true, error: '' })); try { const result = await getFieldAssistantSales(); setSummary({ ...demoSummary, ...(result.summary || {}) }); setState((current) => ({ ...current, loading: false })); } catch (requestError) { setSummary(demoSummary); setState((current) => ({ ...current, loading: false, error: 'Live sales data unavailable. Showing recent sales signals.' })); } }
    useEffect(() => { load(); }, []);
    const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    const cropTotal = summary.revenue_by_crop.reduce((total, item) => total + Number(item.amount || 0), 0) || 1;
    const maxMonth = Math.max(...summary.monthly_revenue.map((item) => Number(item.amount || 0)), 1);
    const colors = ['#1d805a', '#e3a443', '#4e9ab5', '#d46c4d', '#7b83b8'];
    const trend = summary.monthly_revenue.length ? summary.monthly_revenue : demoSummary.monthly_revenue;
    return <main className="field-assistant-page field-assistant-sales-page"><div className="field-assistant-container"><header className="field-assistant-topline"><span><Wallet size={13}/> Field Assistant / Farmer Sales</span><span>Sales &amp; Earnings</span></header><section className="field-assistant-heading"><div><p className="field-assistant-kicker">Farmer sales &amp; earnings</p><h1>Farmer Sales</h1><p>Track sales, payments, and revenue across your assigned farmers.</p></div><button type="button" className="field-assistant-refresh-button" onClick={load} disabled={state.loading}><RefreshCw size={14} className={state.loading ? 'field-assistant-spin' : ''}/> Refresh</button></section>{state.error && <p className="field-assistant-notification-warning" role="status">{state.error}</p>}{state.message && <p className="field-assistant-success" role="status"><Check size={15}/>{state.message}</p>}<section className="field-assistant-sales-summary"><article><span>Total Sales</span><strong>{money(summary.revenue)}</strong><small><b>+14%</b> this month</small></article><article><span>Completed Payments</span><strong>{money(summary.completed_revenue)}</strong><small><b>+75%</b> settled sales</small></article><article><span>Pending Payments</span><strong>{money(summary.pending_amount)}</strong><small>awaiting confirmation</small></article></section><div className="field-assistant-sales-grid"><section className="field-assistant-sales-panel"><div className="field-assistant-panel-heading"><div><span className="field-assistant-panel-label">Sales Trend</span><h2>Revenue over time</h2></div><select aria-label="Sales trend period"><option>This Week</option><option>Last 3 Months</option><option>This Year</option></select></div><div className="field-assistant-sales-chart"><ResponsiveContainer width="100%" height={180}><LineChart data={trend} margin={{ top: 18, right: 8, bottom: 0, left: -22 }}><CartesianGrid stroke="#e6efeb" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" tick={{ fill: '#82958e', fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: '#82958e', fontSize: 9 }} axisLine={false} tickLine={false}/><Tooltip formatter={(value) => [money(value), 'Sales']} contentStyle={{ border: '1px solid #d9e7e2', borderRadius: 6, fontSize: 11 }}/><Line type="monotone" dataKey="amount" stroke="#2a9a6b" strokeWidth={3} dot={{ r: 3, fill: '#2a9a6b', stroke: '#fff', strokeWidth: 2 }}/></LineChart></ResponsiveContainer></div></section><section className="field-assistant-sales-panel"><div className="field-assistant-panel-heading"><div><span className="field-assistant-panel-label">Revenue by Crop</span><h2>Sales mix</h2></div><BarChart3 size={17}/></div><div className="field-assistant-sales-crop-list">{summary.revenue_by_crop.map((item, index) => <div key={item.crop}><span><i style={{ background: colors[index % colors.length] }}/>{item.crop}</span><b>{money(item.amount)}</b><small>{Math.round(Number(item.amount || 0) / cropTotal * 100)}%</small></div>)}</div></section></div><section className="field-assistant-sales-history"><div className="field-assistant-panel-heading"><div><span className="field-assistant-panel-label">Recent Sales</span><h2>Latest completed activity</h2></div><button type="button" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>View all sales <ArrowUpRight size={14}/></button></div><div className="field-assistant-sales-table"><div className="field-assistant-sales-row header"><span>Order ID</span><span>Product</span><span>Quantity</span><span>Price</span><span>Status</span><span>Date</span></div>{summary.history.length ? summary.history.slice(0, 6).map((item) => <div className="field-assistant-sales-row" key={item.order_id}><strong>FD{String(item.order_id).padStart(4, '0')}</strong><span>Produce order</span><span>—</span><span>{money(item.amount)}</span><span className="field-assistant-sales-status">{item.status}</span><span>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recent'}</span></div>) : <div className="field-assistant-sales-empty"><IndianRupee size={24}/><strong>Sales activity will appear here</strong><span>Complete an order to see earnings and payment history.</span></div>}</div></section></div></main>;
}

export function FieldAssistantProfilePage() {
    const navigate = useNavigate();
    const stored = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const storedProfile = stored.profile_data || {};
    const [profile, setProfile] = useState({ full_name: stored.full_name || '', email: stored.email || '', phone: stored.phone || '', village: storedProfile.village || '', address: storedProfile.address || '', language: storedProfile.language || 'English' });
    const [passwords, setPasswords] = useState({ current: '', next: '' });
    const [editing, setEditing] = useState(false);
    const [state, setState] = useState({ saving: false, error: '', message: '' });
    const initials = (profile.full_name || 'Field Assistant').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    function update(field, value) { setProfile((current) => ({ ...current, [field]: value })); }
    async function saveProfile(event) { event.preventDefault(); setState({ saving: true, error: '', message: '' }); try { const result = await updateProfile({ full_name: profile.full_name, email: profile.email, phone: profile.phone, village: profile.village, address: profile.address, language: profile.language }); const nextUser = { ...stored, ...result.user, profile_data: result.user?.profile_data || { ...storedProfile, village: profile.village, address: profile.address, language: profile.language } }; localStorage.setItem('farmdirect_user', JSON.stringify(nextUser)); setEditing(false); setState({ saving: false, error: '', message: 'Profile updated successfully.' }); } catch (requestError) { setState({ saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to update profile', message: '' }); } }
    async function savePassword(event) { event.preventDefault(); setState({ saving: true, error: '', message: '' }); try { await changePassword(passwords.current, passwords.next); setPasswords({ current: '', next: '' }); setState({ saving: false, error: '', message: 'Password updated successfully.' }); } catch (requestError) { setState({ saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to update password', message: '' }); } }
    const fields = [{ label: 'Full Name', key: 'full_name', value: profile.full_name, icon: UserRound, type: 'text' }, { label: 'Email', key: 'email', value: profile.email, icon: AtSign, type: 'email' }, { label: 'Phone', key: 'phone', value: profile.phone, icon: Phone, type: 'tel' }, { label: 'Village', key: 'village', value: profile.village, icon: MapPin, type: 'text' }, { label: 'Address', key: 'address', value: profile.address, icon: MapPin, type: 'text' }, { label: 'Language', key: 'language', value: profile.language, icon: ShieldCheck, type: 'text' }];
    return <main className="field-assistant-page field-assistant-profile-page"><div className="field-assistant-container"><header className="field-assistant-topline"><span><UserRound size={13}/> Field Assistant / Profile</span><span>Account settings</span></header><section className="field-assistant-heading"><div><p className="field-assistant-kicker">Profile</p><h1>Profile</h1><p>Manage your Field Assistant information and account security.</p></div><button type="button" className="field-assistant-back-button" onClick={() => navigate('/dashboard/field-assistant')}><ArrowLeft size={15}/> Dashboard</button></section>{state.message && <p className="field-assistant-success" role="status"><Check size={15}/>{state.message}</p>}{state.error && <p className="field-assistant-form-error" role="alert">{state.error}</p>}<section className="field-assistant-profile-hero"><div className="field-assistant-profile-avatar">{initials}</div><div><span className="field-assistant-panel-label">Field Assistant</span><h2>{profile.full_name || 'Field Assistant'}</h2><p>Account ID: {stored.id ? `FA${String(stored.id).padStart(6, '0')}` : 'FA-001'}</p></div><button type="button" className="field-assistant-primary-button" onClick={() => setEditing((current) => !current)}>{editing ? <><X size={15}/> Cancel</> : <><Edit3 size={15}/> Edit Profile</>}</button></section><form className="field-assistant-profile-card" onSubmit={saveProfile}><div className="field-assistant-profile-card-head"><div><span className="field-assistant-panel-label">Profile Information</span><h2>Personal details</h2></div><span className="field-assistant-profile-status"><i/> Active</span></div><div className="field-assistant-profile-grid">{fields.map(({ label, key, value, icon: Icon, type }) => <label key={key}><span><Icon size={13}/> {label}</span>{editing ? <input type={type} value={value} onChange={(event) => update(key, event.target.value)} required={key === 'full_name'}/> : <strong>{value || 'Not provided'}</strong>}</label>)}</div>{editing && <div className="field-assistant-profile-actions"><button type="submit" className="field-assistant-primary-button" disabled={state.saving}>{state.saving ? <LoaderCircle size={15} className="field-assistant-spin"/> : <Save size={15}/>} {state.saving ? 'Saving...' : 'Save changes'}</button></div>}</form><section className="field-assistant-profile-security"><div><span className="field-assistant-panel-label">Security</span><h2>Change password</h2><p>Keep your Field Assistant account protected.</p></div><form onSubmit={savePassword}><label><span><KeyRound size={13}/> Current password</span><input type="password" value={passwords.current} onChange={(event) => setPasswords((current) => ({ ...current, current: event.target.value }))} minLength="6" required/></label><label><span><ShieldCheck size={13}/> New password</span><input type="password" value={passwords.next} onChange={(event) => setPasswords((current) => ({ ...current, next: event.target.value }))} minLength="6" required/></label><button type="submit" className="field-assistant-secondary-button" disabled={state.saving}>Update password</button></form></section></div></main>;
}

export function FieldAssistantNotificationsPage() {
    const demoItems = [
        { id: 'demo-order', title: 'New order for Farmer Suresh', message: 'Tomato · 500 kg · Pending confirmation', created_at: new Date().toISOString(), is_read: false, demo: true },
        { id: 'demo-payment', title: 'Payment received', message: '₹12,500 · Farmer Ramesh Kumar', created_at: new Date(Date.now() - 3600000).toISOString(), is_read: false, demo: true },
        { id: 'demo-farmer', title: 'Farmer registration completed', message: 'Lakshmi Devi · FDO4', created_at: new Date(Date.now() - 7200000).toISOString(), is_read: true, demo: true },
        { id: 'demo-pickup', title: 'Pickup scheduled', message: 'Order FD1025 · Rice · 1,200 kg', created_at: new Date(Date.now() - 10800000).toISOString(), is_read: true, demo: true },
        { id: 'demo-ai', title: 'AI Price Alert', message: 'Tomato prices are increasing in your region', created_at: new Date(Date.now() - 14400000).toISOString(), is_read: false, demo: true },
        { id: 'demo-message', title: 'New message from Farmer Ramesh', message: 'Product quality update', created_at: new Date(Date.now() - 86400000).toISOString(), is_read: true, demo: true },
    ];
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
    async function load() { setState((current) => ({ ...current, loading: true, error: '' })); try { const result = await getNotifications(); setItems(result.items?.length ? result.items : demoItems); setState((current) => ({ ...current, loading: false })); } catch (requestError) { setItems(demoItems); setState((current) => ({ ...current, loading: false, error: requestError instanceof Error ? 'Live notifications unavailable. Showing recent activity.' : 'Live notifications unavailable. Showing recent activity.' })); } }
    useEffect(() => { load(); }, []);
    const unread = items.filter((item) => !item.is_read).length;
    const visibleItems = items.filter((item) => filter === 'ALL' || (filter === 'UNREAD' && !item.is_read) || (filter === 'ORDERS' && /order|pickup|delivery/i.test(`${item.title} ${item.message}`)) || (filter === 'ALERTS' && /alert|price|warning/i.test(`${item.title} ${item.message}`)));
    function iconFor(item) { const value = `${item.title} ${item.message}`.toLowerCase(); if (value.includes('payment')) return CreditCard; if (value.includes('order') || value.includes('pickup')) return ShoppingBag; if (value.includes('alert') || value.includes('warning')) return CircleAlert; if (value.includes('message')) return Bell; return Info; }
    async function read(item) { if (item.demo) { setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry)); setState((current) => ({ ...current, message: 'Notification marked as read.' })); return; } try { await markNotificationRead(item.id); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry)); setState((current) => ({ ...current, message: 'Notification marked as read.' })); } catch (requestError) { setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to update notification' })); } }
    async function markAll() { setState((current) => ({ ...current, saving: true, error: '', message: '' })); try { await Promise.all(items.filter((item) => !item.is_read && !item.demo).map((item) => markNotificationRead(item.id))); setItems((current) => current.map((item) => ({ ...item, is_read: true }))); setState((current) => ({ ...current, saving: false, message: 'All notifications marked as read.' })); } catch (requestError) { setState((current) => ({ ...current, saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to mark all notifications' })); } }
    const timeLabel = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'Recent';
    return <main className="field-assistant-page field-assistant-notifications-page"><div className="field-assistant-container"><header className="field-assistant-topline"><span><Bell size={13}/> Field Assistant / Notifications</span><span>{unread} unread updates</span></header><section className="field-assistant-heading"><div><p className="field-assistant-kicker">Stay informed</p><h1>Notifications</h1><p>Keep up with your farmers, orders, payments, and AI recommendations.</p></div><div className="field-assistant-notification-actions"><button type="button" className="field-assistant-icon-button" onClick={load} aria-label="Refresh notifications"><RefreshCw size={16} className={state.loading ? 'field-assistant-spin' : ''}/></button><button type="button" className="field-assistant-primary-button" onClick={markAll} disabled={!unread || state.saving}>{state.saving ? 'Updating...' : 'Mark all as read'}</button></div></section>{state.message && <p className="field-assistant-success" role="status"><Check size={15}/>{state.message}</p>}{state.error && <p className="field-assistant-notification-warning" role="status">{state.error}</p>}<section className="field-assistant-notification-panel"><div className="field-assistant-notification-toolbar"><div><span className="field-assistant-panel-label">Activity centre</span><h2>{visibleItems.length} notifications</h2></div><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Notification filter"><option value="ALL">All notifications</option><option value="UNREAD">Unread only</option><option value="ORDERS">Orders & pickups</option><option value="ALERTS">AI alerts</option></select></div><div className="field-assistant-notification-list">{state.loading ? <div className="field-assistant-table-loading"><LoaderCircle size={18} className="field-assistant-spin"/> Loading notifications...</div> : visibleItems.map((item) => { const Icon = iconFor(item); return <article className={`field-assistant-notification-row ${item.is_read ? 'is-read' : 'is-unread'}`} key={item.id}><span className="field-assistant-notification-icon"><Icon size={15}/></span><div className="field-assistant-notification-copy"><div><strong>{item.title}</strong><time>{timeLabel(item.created_at)}</time></div><p>{item.message}</p></div>{!item.is_read ? <button type="button" className="field-assistant-notification-read" onClick={() => read(item)}>Mark read</button> : <span className="field-assistant-notification-seen">Seen</span>}</article>})}{!state.loading && !visibleItems.length && <div className="field-assistant-table-empty"><Bell size={26}/><strong>No notifications in this view</strong><span>New farmer activity will appear here.</span></div>}</div></section></div></main>;
}

function FieldAssistantDemandPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [crop, setCrop] = useState('');
    const [location, setLocation] = useState('');
    const [forecast, setForecast] = useState(null);
    const [state, setState] = useState({ loading: true, forecasting: false, error: '', message: '' });
    async function loadProducts() {
        setState((current) => ({ ...current, loading: true, error: '' }));
        try { const result = await getFieldAssistantProducts(); const items = result.items || []; setProducts(items); if (items[0]) { setCrop(items[0].crop || items[0].name); setLocation(items[0].location || ''); } setState((current) => ({ ...current, loading: false })); }
        catch (requestError) { setState((current) => ({ ...current, loading: false, error: requestError instanceof Error ? requestError.message : 'Unable to load demand inputs' })); }
    }
    useEffect(() => { loadProducts(); }, []);
    async function runForecast(event) { event.preventDefault(); setState((current) => ({ ...current, forecasting: true, error: '', message: '' })); try { const result = await getDemandForecast(crop); setForecast(result.forecast || null); setState((current) => ({ ...current, forecasting: false, message: result.forecast ? 'Demand forecast updated from recorded orders.' : result.message || 'No forecast available for this crop.' })); } catch (requestError) { setState((current) => ({ ...current, forecasting: false, error: requestError instanceof Error ? requestError.message : 'Unable to calculate demand forecast' })); } }
    const observed = Number(forecast?.observed_demand || 0);
    const chartData = forecast ? [{ day: 'Mon', demand: Math.round(observed * .55) }, { day: 'Tue', demand: Math.round(observed * .68) }, { day: 'Wed', demand: Math.round(observed * .62) }, { day: 'Thu', demand: Math.round(observed * .8) }, { day: 'Fri', demand: Math.round(observed * .74) }, { day: 'Sat', demand: Math.round(observed * .94) }, { day: 'Sun', demand: observed }] : [{ day: 'Mon', demand: 20 }, { day: 'Tue', demand: 31 }, { day: 'Wed', demand: 27 }, { day: 'Thu', demand: 44 }, { day: 'Fri', demand: 39 }, { day: 'Sat', demand: 54 }, { day: 'Sun', demand: 61 }];
    const demandLevel = forecast?.demand_level || 'Waiting';
    const nextSeven = Number(forecast?.forecasted_7_day || 0);
    const nextThirty = Number(forecast?.forecasted_30_day || 0);
    const selectedProduct = products.find((item) => (item.crop || item.name)?.toLowerCase() === crop.toLowerCase()) || products[0] || { name: crop || 'Tomato', crop: crop || 'Tomato' };
    return <main className="field-assistant-page field-assistant-demand-page"><div className="field-assistant-container"><header className="field-assistant-topline"><span><Wheat size={13}/> Field Assistant / AI Demand Forecast</span><span>Planning intelligence</span></header><section className="field-assistant-heading"><div><p className="field-assistant-kicker">AI-powered planning</p><h1>AI Demand Forecast</h1><p>Plan harvest and support assigned farmers with demand signals from marketplace orders.</p></div><button type="button" className="field-assistant-back-button" onClick={() => navigate('/dashboard/field-assistant')}><ArrowLeft size={15}/> Dashboard</button></section>{state.message && <p className="field-assistant-success" role="status"><CheckCircle2 size={15}/>{state.message}</p>}{state.error && <p className="field-assistant-form-error" role="alert">{state.error}</p>}<div className="field-assistant-demand-layout"><form className="field-assistant-demand-form" onSubmit={runForecast}><div className="field-assistant-form-intro"><span>01 / Forecast Inputs</span><h2>AI Demand Forecast</h2><p>Select a crop and location to see the next demand signal.</p></div><label><span>Crop <b>*</b></span><select value={crop} onChange={(event) => setCrop(event.target.value)} required><option value="">Select crop</option>{[...new Set(products.map((item) => item.crop || item.name).filter(Boolean))].map((item) => <option value={item} key={item}>{item}</option>)}{!products.length && <option value="Tomato">Tomato</option>}</select></label><label><span>Location</span><select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">All locations</option>{[...new Set(products.map((item) => item.location).filter(Boolean))].map((item) => <option value={item} key={item}>{item}</option>)}</select></label><button type="submit" className="field-assistant-primary-button" disabled={state.forecasting || !crop}>{state.forecasting ? <LoaderCircle size={15} className="field-assistant-spin"/> : <RefreshCw size={15}/>} {state.forecasting ? 'Calculating...' : 'View Forecast'}</button></form><section className="field-assistant-demand-result"><div className="field-assistant-demand-result-head"><div><span className="field-assistant-panel-label">Demand Trend</span><h2>{crop || 'Your crop'}</h2></div><span className="field-assistant-ai-pill">Powered by AI</span></div><div className="field-assistant-demand-chart"><ResponsiveContainer width="100%" height={190}><LineChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -22 }}><CartesianGrid stroke="#e5efeb" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="day" tick={{ fill: '#82958e', fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: '#82958e', fontSize: 9 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ border: '1px solid #d9e7e2', borderRadius: 6, fontSize: 11 }} formatter={(value) => [`${value} kg`, 'Demand']}/><Line type="monotone" dataKey="demand" stroke="#32a875" strokeWidth={3} dot={{ r: 3, fill: '#32a875', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }}/></LineChart></ResponsiveContainer></div><div className="field-assistant-demand-signals"><div><span>Current Demand</span><strong className={`field-assistant-demand-level ${demandLevel.toLowerCase()}`}>{demandLevel}</strong><small>{forecast?.order_lines || 0} order lines</small></div><div><span>Expected Demand</span><strong>{forecast ? 'Increasing' : 'Waiting'}</strong><small>next forecast window</small></div></div><div className="field-assistant-demand-quantity"><div><span>Forecasted Quantity</span><strong>Next 7 days <b>{nextSeven ? `${nextSeven.toLocaleString('en-IN')} kg` : 'Waiting'}</b></strong><strong>Next 30 days <b>{nextThirty ? `${nextThirty.toLocaleString('en-IN')} kg` : 'Waiting'}</b></strong></div><img src={getProductImage(selectedProduct)} alt={`${selectedProduct.name || crop} forecast`}/></div></section></div><section className="field-assistant-demand-note"><Wheat size={17}/><div><strong>How to use this forecast</strong><p>Use rising demand to help farmers plan harvest timing, stock levels, and buyer conversations. More completed orders improve the signal.</p></div></section></div></main>;
}

function FieldAssistantOrdersPage() {
    const filters = ['ALL', 'NEW', 'PENDING', 'CONFIRMED', 'LOGISTICS_REQUESTED', 'DELIVERED'];
    const labels = { ALL: 'All Orders', NEW: 'New', PENDING: 'Pending', CONFIRMED: 'Confirmed', LOGISTICS_REQUESTED: 'Pickup Scheduled', DELIVERED: 'Delivered' };
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
    async function load() { setState((current) => ({ ...current, loading: true, error: '' })); try { const result = await getOrders(); setOrders(result.items || []); setState((current) => ({ ...current, loading: false })); } catch (requestError) { setState((current) => ({ ...current, loading: false, error: requestError instanceof Error ? requestError.message : 'Unable to load orders' })); } }
    useEffect(() => { load(); }, []);
    const visibleOrders = orders.filter((order) => filter === 'ALL' || (filter === 'NEW' ? order.status === 'PAID' : filter === 'PENDING' ? order.status === 'PENDING' : order.status === filter));
    const countFor = (item) => item === 'ALL' ? orders.length : orders.filter((order) => item === 'NEW' ? order.status === 'PAID' : item === 'PENDING' ? order.status === 'PENDING' : order.status === item).length;
    const statusLabel = (status) => ({ PENDING: 'Pending', PAID: 'Paid', CONFIRMED: 'Confirmed', LOGISTICS_REQUESTED: 'In Progress', DELIVERED: 'Delivered', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }[status] || status);
    const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent order';
    async function advance(order) { const next = ['PENDING', 'PAID'].includes(order.status) ? 'CONFIRMED' : order.status === 'CONFIRMED' ? 'LOGISTICS_REQUESTED' : ''; if (!next) return; setState((current) => ({ ...current, saving: true, error: '', message: '' })); try { await updateOrderStatus(order.id, next); setState((current) => ({ ...current, saving: false, message: next === 'CONFIRMED' ? `Order #${order.id} confirmed.` : `Order #${order.id} sent to logistics.` })); await load(); } catch (requestError) { setState((current) => ({ ...current, saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to update order' })); } }
    return <main className="field-assistant-page field-assistant-orders-page"><div className="field-assistant-container"><header className="field-assistant-topline"><span><ClipboardList size={13}/> Field Assistant / Farmer Orders</span><span>{orders.length} total orders</span></header><section className="field-assistant-heading"><div><p className="field-assistant-kicker">Order management</p><h1>Farmer Orders</h1><p>Review incoming orders and move each assigned farmer shipment forward.</p></div><button type="button" className="field-assistant-refresh-button" onClick={load} disabled={state.loading}><RefreshCw size={14} className={state.loading ? 'field-assistant-spin' : ''}/> Refresh</button></section>{state.message && <p className="field-assistant-success" role="status"><Check size={15}/>{state.message}</p>}{state.error && <p className="field-assistant-form-error" role="alert">{state.error}</p>}<section className="field-assistant-order-summary"><article><span>Total Orders</span><strong>{orders.length}</strong><small>assigned farmer orders</small></article><article><span>Pending</span><strong>{orders.filter((order) => ['PENDING', 'PAID'].includes(order.status)).length}</strong><small>need your review</small></article><article><span>In Progress</span><strong>{orders.filter((order) => ['CONFIRMED', 'LOGISTICS_REQUESTED'].includes(order.status)).length}</strong><small>moving through fulfilment</small></article><article><span>Completed</span><strong>{orders.filter((order) => ['DELIVERED', 'COMPLETED'].includes(order.status)).length}</strong><small>finished orders</small></article></section><section className="field-assistant-orders-panel"><div className="field-assistant-orders-toolbar"><div className="field-assistant-order-filters" role="tablist" aria-label="Filter farmer orders">{filters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)} key={item}>{labels[item]} <b>{countFor(item)}</b></button>)}</div><span>{visibleOrders.length} orders</span></div><div className="field-assistant-orders-list">{state.loading ? <div className="field-assistant-table-loading"><LoaderCircle size={18} className="field-assistant-spin"/> Loading orders...</div> : visibleOrders.map((order) => { const item = order.items?.[0]; return <article className="field-assistant-order-row" key={order.id}><div className="field-assistant-order-product"><img src={getProductImage({ name: item?.product_name })} alt=""/><div><strong>{item?.product_name || `Order #${order.id}`}</strong><span>{item ? `${item.quantity} units · Order #${order.id}` : `Order #${order.id}`}</span></div></div><div className="field-assistant-order-amount"><span>Total Amount</span><strong>₹{Number(order.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div><div className="field-assistant-order-date"><span>Order Date</span><strong>{dateLabel(order.created_at)}</strong></div><span className={`field-assistant-order-status status-${order.status.toLowerCase()}`}><Clock3 size={12}/>{statusLabel(order.status)}</span><div className="field-assistant-order-actions">{['PENDING', 'PAID'].includes(order.status) && <button type="button" className="field-assistant-order-primary" onClick={() => advance(order)} disabled={state.saving}><Check size={13}/> Accept</button>}{order.status === 'CONFIRMED' && <button type="button" className="field-assistant-order-primary" onClick={() => advance(order)} disabled={state.saving}><Truck size={13}/> Logistics</button>}<button type="button" className="field-assistant-order-view" onClick={() => setSelected(order)}><Eye size={13}/> View</button><ChevronRight size={15} className="field-assistant-order-arrow"/></div></article>; })}{!state.loading && !visibleOrders.length && <div className="field-assistant-table-empty"><ClipboardList size={26}/><strong>No orders in this view</strong><span>New customer orders for assigned farmers will appear here.</span></div>}</div></section>{selected && <section className="field-assistant-order-detail"><div><span className="field-assistant-panel-label">Order #{selected.id}</span><h2>Order details</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close order details"><X size={16}/></button><div className="field-assistant-order-detail-grid"><div><span>Status</span><strong>{statusLabel(selected.status)}</strong></div><div><span>Placed</span><strong>{dateLabel(selected.created_at)}</strong></div><div><span>Products</span><strong>{selected.items?.length || 0} item(s)</strong></div><div><span>Total</span><strong>₹{Number(selected.total_amount || 0).toLocaleString('en-IN')}</strong></div></div></section>}</div></main>;
}

function FieldAssistantInventoryPage({ farmers }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ quantity: '', price: '' });
    const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
    const farmerMap = Object.fromEntries(farmers.map((assignment) => [assignment.farmer_id || assignment.farmer?.id || assignment.id, assignment.farmer?.full_name || assignment.name || `Farmer #${assignment.farmer_id || assignment.id}`]));

    async function loadProducts() {
        setState((current) => ({ ...current, loading: true, error: '' }));
        try {
            const result = await getFieldAssistantProducts();
            setProducts(result.items || []);
            setState((current) => ({ ...current, loading: false }));
        } catch (requestError) {
            setState((current) => ({ ...current, loading: false, error: requestError instanceof Error ? requestError.message : 'Unable to load inventory' }));
        }
    }

    useEffect(() => { loadProducts(); }, []);
    const filteredProducts = products.filter((product) => `${product.name} ${product.crop} ${farmerMap[product.farmer_id] || ''} ${product.location}`.toLowerCase().includes(search.trim().toLowerCase()) && (filter === 'ALL' || (filter === 'AVAILABLE' && product.is_active !== false && Number(product.quantity) > 0) || (filter === 'OUT' && Number(product.quantity) <= 0) || (filter === 'PAUSED' && product.is_active === false)));
    const availableStock = products.reduce((sum, product) => sum + (product.is_active === false ? 0 : Number(product.quantity || 0)), 0);
    const catalogueValue = products.reduce((sum, product) => sum + (product.is_active === false ? 0 : Number(product.quantity || 0) * Number(product.price || 0)), 0);

    function startEdit(product) { setEditingId(product.id); setEditForm({ quantity: product.quantity, price: product.price }); setState((current) => ({ ...current, message: '' })); }
    async function saveEdit(product) {
        setState((current) => ({ ...current, saving: true, error: '', message: '' }));
        try {
            await updateFieldAssistantProduct(product.id, { quantity: Number(editForm.quantity), price: Number(editForm.price) });
            setEditingId(null);
            setState((current) => ({ ...current, saving: false, message: 'Inventory updated successfully.' }));
            await loadProducts();
        } catch (requestError) { setState((current) => ({ ...current, saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to update inventory' })); }
    }
    async function toggleProduct(product) {
        setState((current) => ({ ...current, saving: true, error: '', message: '' }));
        try { await updateFieldAssistantProduct(product.id, { is_active: product.is_active === false }); setState((current) => ({ ...current, saving: false, message: product.is_active === false ? 'Product relisted.' : 'Product paused.' })); await loadProducts(); }
        catch (requestError) { setState((current) => ({ ...current, saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to update product' })); }
    }

    return <main className="field-assistant-page field-assistant-inventory-page"><div className="field-assistant-container"><header className="field-assistant-topline"><span><ClipboardList size={13}/> Field Assistant / Farmer Inventory</span><span>{products.length} listed products</span></header><section className="field-assistant-heading"><div><p className="field-assistant-kicker">Inventory management</p><h1>Farmer Inventory</h1><p>Keep assigned farmer stock accurate and ready for buyers.</p></div><button type="button" className="field-assistant-primary-button" onClick={() => navigate('/field-assistant/add-produce')}><Plus size={15}/> Add Produce</button></section>{state.message && <p className="field-assistant-success" role="status"><CheckCircle2 size={15}/>{state.message}</p>}{state.error && <p className="field-assistant-form-error" role="alert">{state.error}</p>}<section className="field-assistant-inventory-summary"><article><span>Available Stock</span><strong>{availableStock.toLocaleString('en-IN')} kg</strong><small>active listings</small><Wheat size={18}/></article><article><span>Products Listed</span><strong>{products.length}</strong><small>assigned farmers</small><PackageOpen size={18}/></article><article><span>Out of Stock</span><strong>{products.filter((product) => Number(product.quantity) <= 0).length}</strong><small>needs attention</small><ClipboardList size={18}/></article><article><span>Catalogue Value</span><strong>₹{catalogueValue.toLocaleString('en-IN')}</strong><small>current stock value</small><Wallet size={18}/></article></section><section className="field-assistant-inventory-panel"><div className="field-assistant-inventory-toolbar"><label><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search produce, farmers, or locations..." aria-label="Search inventory"/></label><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter inventory"><option value="ALL">All Products</option><option value="AVAILABLE">Available</option><option value="OUT">Out of Stock</option><option value="PAUSED">Paused</option></select><button type="button" className="field-assistant-refresh-button" onClick={loadProducts} disabled={state.loading}><RefreshCw size={14} className={state.loading ? 'field-assistant-spin' : ''}/> Refresh</button></div><div className="field-assistant-inventory-table-wrap"><table className="field-assistant-inventory-table"><thead><tr><th>Product</th><th>Farmer</th><th>Available</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>{state.loading ? <tr><td colSpan="6"><span className="field-assistant-table-loading"><LoaderCircle size={17} className="field-assistant-spin"/> Loading inventory...</span></td></tr> : filteredProducts.map((product) => <tr key={product.id}><td><div className="field-assistant-inventory-product"><img src={getProductImage(product)} alt=""/><span><strong>{product.name}</strong><small>{product.crop} · {product.location}</small></span></div></td><td>{farmerMap[product.farmer_id] || `Farmer #${product.farmer_id}`}</td><td>{editingId === product.id ? <input className="field-assistant-inline-number" type="number" min="0.01" value={editForm.quantity} onChange={(event) => setEditForm((current) => ({ ...current, quantity: event.target.value }))}/> : `${product.quantity} ${product.unit}`}</td><td>{editingId === product.id ? <input className="field-assistant-inline-number" type="number" min="0" value={editForm.price} onChange={(event) => setEditForm((current) => ({ ...current, price: event.target.value }))}/> : `₹${product.price}/${product.unit}`}</td><td><span className={`field-assistant-stock-pill ${product.is_active === false ? 'is-paused' : Number(product.quantity) > 0 ? 'is-available' : 'is-empty'}`}>{product.is_active === false ? 'Paused' : Number(product.quantity) > 0 ? 'Available' : 'Out of stock'}</span></td><td><div className="field-assistant-table-actions">{editingId === product.id ? <><button type="button" onClick={() => saveEdit(product)} disabled={state.saving} aria-label="Save inventory"><Save size={14}/></button><button type="button" onClick={() => setEditingId(null)} aria-label="Cancel edit"><X size={14}/></button></> : <><button type="button" onClick={() => startEdit(product)} aria-label={`Edit ${product.name}`}><Edit3 size={14}/></button><button type="button" onClick={() => toggleProduct(product)} aria-label={product.is_active === false ? `Relist ${product.name}` : `Pause ${product.name}`}>{product.is_active === false ? <Check size={14}/> : <X size={14}/>}</button></>}</div></td></tr>)}{!state.loading && filteredProducts.length === 0 && <tr><td colSpan="6"><div className="field-assistant-table-empty"><PackageOpen size={25}/><strong>No inventory matches this view</strong><span>Add produce or adjust your filters.</span></div></td></tr>}</tbody></table></div></section></div></main>;
}

function FieldAssistantAddProducePage({ farmers }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({ farmer_id: '', name: '', crop: '', category: 'Vegetable', quantity: '', unit: 'kg', price: '', quality: 'Grade A', location: '', harvest_date: '', shelf_life: '', min_order_quantity: '', description: '', image_file: null });
    const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
    const farmerOptions = farmers.map((assignment) => ({ id: assignment.farmer_id || assignment.farmer?.id || assignment.id, name: assignment.farmer?.full_name || assignment.name || `Farmer #${assignment.farmer_id || assignment.id}`, village: assignment.farmer?.profile_data?.village || assignment.farmer?.village || assignment.village || 'Village not set' }));

    async function loadProducts() {
        setState((current) => ({ ...current, loading: true, error: '' }));
        try {
            const result = await getFieldAssistantProducts();
            setProducts(result.items || []);
        } catch (requestError) {
            setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to load produce', loading: false }));
            return;
        }
        setState((current) => ({ ...current, loading: false }));
    }

    useEffect(() => { loadProducts(); }, []);
    useEffect(() => { if (!form.farmer_id && farmerOptions[0]) setForm((current) => ({ ...current, farmer_id: String(farmerOptions[0].id) })); }, [farmers]);
    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
    const canSubmit = Boolean(form.farmer_id && form.name.trim() && form.crop.trim() && form.quantity && form.price !== '' && form.location.trim());

    async function submit(event) {
        event.preventDefault();
        setState((current) => ({ ...current, saving: true, error: '', message: '' }));
        try {
            const { image_file, ...productForm } = form;
            const result = await createFieldAssistantProduct({ ...productForm, farmer_id: Number(form.farmer_id), quantity: Number(form.quantity), price: Number(form.price) });
            if (image_file && result.product?.id) await uploadFieldAssistantProductImage(result.product.id, image_file);
            setForm((current) => ({ ...current, name: '', crop: '', quantity: '', price: '', harvest_date: '', shelf_life: '', min_order_quantity: '', description: '', image_file: null }));
            setState((current) => ({ ...current, saving: false, message: 'Produce added successfully.' }));
            await loadProducts();
        } catch (requestError) {
            setState((current) => ({ ...current, saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to add produce' }));
        }
    }

    return <main className="field-assistant-page field-assistant-produce-page">
        <div className="field-assistant-container">
            <header className="field-assistant-topline"><span><Wheat size={13}/> Field Assistant / Add Produce</span><span>Farmer catalogue</span></header>
            <section className="field-assistant-heading"><div><p className="field-assistant-kicker">Produce management</p><h1>Add Produce</h1><p>List produce for an assigned farmer with the details buyers need.</p></div><button type="button" className="field-assistant-back-button" onClick={() => navigate('/field-assistant/inventory')}><PackageOpen size={15}/> Farmer Inventory</button></section>
            {state.message && <p className="field-assistant-success" role="status"><CheckCircle2 size={15}/>{state.message}</p>}{state.error && <p className="field-assistant-form-error" role="alert">{state.error}</p>}
            {farmerOptions.length === 0 ? <section className="field-assistant-empty"><UserPlus size={28}/><h2>Register a farmer first</h2><p>Produce must be connected to one of your assigned farmers.</p><button type="button" className="field-assistant-primary-button" onClick={() => navigate('/field-assistant/register-farmer')}><UserPlus size={15}/> Register Farmer</button></section> : <div className="field-assistant-produce-layout"><form className="field-assistant-produce-form" onSubmit={submit}><div className="field-assistant-form-intro"><span>01 / Product Listing</span><h2>Add Produce for Farmer</h2><p>Select a farmer and capture the current harvest details.</p></div><div className="field-assistant-form-grid"><label className="field-assistant-form-wide"><span>Farmer Name <b>*</b></span><select value={form.farmer_id} onChange={(event) => update('farmer_id', event.target.value)} required><option value="">Select farmer</option>{farmerOptions.map((farmer) => <option value={farmer.id} key={farmer.id}>{farmer.name} · {farmer.village}</option>)}</select></label><label><span>Product Name <b>*</b></span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Tomato" required/></label><label><span>Category</span><select value={form.category} onChange={(event) => update('category', event.target.value)}><option>Vegetable</option><option>Fruit</option><option>Grain</option><option>Other</option></select></label><label><span>Variety / Crop <b>*</b></span><input value={form.crop} onChange={(event) => update('crop', event.target.value)} placeholder="e.g. Hybrid" required/></label><label><span>Quantity <b>*</b></span><div className="field-assistant-input-split"><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} placeholder="500" required/><select value={form.unit} onChange={(event) => update('unit', event.target.value)}><option>kg</option><option>quintal</option><option>ton</option><option>piece</option></select></div></label><label><span>Price per {form.unit} <b>*</b></span><div className="field-assistant-input-prefix"><b>₹</b><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => update('price', event.target.value)} placeholder="40" required/></div></label><label><span>Quality</span><select value={form.quality} onChange={(event) => update('quality', event.target.value)}><option>Grade A</option><option>Grade B</option><option>Organic</option></select></label><label><span>Location <b>*</b></span><input value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="e.g. Guntur" required/></label><label><span>Harvest Date</span><input type="date" value={form.harvest_date} onChange={(event) => update('harvest_date', event.target.value)}/></label><label><span>Expected Shelf-Life</span><input value={form.shelf_life} onChange={(event) => update('shelf_life', event.target.value)} placeholder="e.g. 7 days"/></label><label><span>Minimum Order Quantity</span><input type="number" min="0" step="0.01" value={form.min_order_quantity} onChange={(event) => update('min_order_quantity', event.target.value)} placeholder="e.g. 10 kg"/></label><label className="field-assistant-form-wide"><span>Description</span><textarea rows="3" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Add notes about freshness, packing, or quality"/></label></div><div className="field-assistant-produce-actions"><button type="button" className="field-assistant-secondary-button" onClick={() => navigate('/field-assistant/inventory')}>Cancel</button><button type="submit" className="field-assistant-primary-button" disabled={!canSubmit || state.saving}>{state.saving ? <LoaderCircle size={15} className="field-assistant-spin"/> : <Check size={15}/>} {state.saving ? 'Saving...' : 'Add Produce'}</button></div></form><aside className="field-assistant-produce-side"><label className="field-assistant-produce-upload"><ImagePlus size={23}/><strong>{form.image_file ? form.image_file.name : 'Product Images'}</strong><p>Upload a JPG, PNG, or WEBP image for this listing.</p><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => update('image_file', event.target.files?.[0] || null)}/></label><div className="field-assistant-recent-products"><div className="field-assistant-panel-heading"><div><span className="field-assistant-panel-label">Recent listings</span><h2>{products.length} products</h2></div><RefreshCw size={15} className={state.loading ? 'field-assistant-spin' : ''}/></div>{products.slice(0, 4).map((product) => <div className="field-assistant-recent-product" key={product.id}><img src={getProductImage(product)} alt=""/><div><strong>{product.name}</strong><span>{product.quantity} {product.unit} · ₹{product.price}</span></div><b>{product.quality || 'Grade A'}</b></div>)}{!products.length && <p className="field-assistant-side-empty">No produce has been listed yet.</p>}</div></aside></div>}
        </div>
    </main>;
}

function FieldAssistantRegisterFarmerPage() {
    const navigate = useNavigate();
    const steps = ['Basic Details', 'Farm Details', 'Crop Information', 'Review'];
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ full_name: '', phone: '', village: '', address: '', language: 'English', farm_size: '', farm_type: 'Open field', crops: '', crop_notes: '' });
    const [state, setState] = useState({ saving: false, error: '', success: '' });
    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
    const requiredByStep = [['full_name', 'phone', 'village'], ['address', 'farm_size'], ['crops', 'language']];
    const canContinue = step === 3 || requiredByStep[step].every((field) => form[field].trim());

    async function submit(event) {
        event.preventDefault();
        if (step < 3) {
            if (canContinue) setStep((current) => current + 1);
            return;
        }
        setState({ saving: true, error: '', success: '' });
        try {
            const result = await registerFieldFarmer(form);
            setState({ saving: false, error: '', success: result.message || 'Farmer registered successfully.' });
        } catch (requestError) {
            setState({ saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to register farmer.', success: '' });
        }
    }

    return <main className="field-assistant-page field-assistant-register-page">
        <div className="field-assistant-container">
            <header className="field-assistant-topline"><span><UserPlus size={13}/> Field Assistant / Register Farmer</span><span>New farmer onboarding</span></header>
            <section className="field-assistant-heading"><div><p className="field-assistant-kicker">Farmer management</p><h1>Register Farmer</h1><p>Add a farmer to your field team in a few quick steps.</p></div><button type="button" className="field-assistant-back-button" onClick={() => navigate('/field-assistant/farmers')}><ArrowLeft size={15}/> My Farmers</button></section>
            <section className="field-assistant-register-shell">
                <div className="field-assistant-register-steps">{steps.map((label, index) => <div className={`field-assistant-register-step ${index === step ? 'is-current' : ''} ${index < step ? 'is-complete' : ''}`} key={label}><span>{index < step ? <Check size={13}/> : index + 1}</span><strong>{label}</strong>{index < steps.length - 1 && <i/>}</div>)}</div>
                <form className="field-assistant-register-form" onSubmit={submit}>
                    {step === 0 && <div className="field-assistant-form-step"><div className="field-assistant-form-intro"><span>01 / Basic Details</span><h2>Personal Information</h2><p>Start with the farmer’s contact details.</p></div><div className="field-assistant-form-grid"><label><span>Farmer Name <b>*</b></span><input value={form.full_name} onChange={(event) => update('full_name', event.target.value)} placeholder="Enter farmer name" autoFocus required/></label><label><span>Mobile Number <b>*</b></span><input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+91 9876543210" required/></label><label><span>Village <b>*</b></span><input value={form.village} onChange={(event) => update('village', event.target.value)} placeholder="Enter village" required/></label></div></div>}
                    {step === 1 && <div className="field-assistant-form-step"><div className="field-assistant-form-intro"><span>02 / Farm Details</span><h2>Farm Information</h2><p>Capture the farm location and operating context.</p></div><div className="field-assistant-form-grid"><label className="field-assistant-form-wide"><span>Address <b>*</b></span><textarea value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Enter complete farm address" rows="3" required/></label><label><span>Farm Size <b>*</b></span><input value={form.farm_size} onChange={(event) => update('farm_size', event.target.value)} placeholder="e.g. 2.5 acres" required/></label><label><span>Farm Type</span><select value={form.farm_type} onChange={(event) => update('farm_type', event.target.value)}><option>Open field</option><option>Greenhouse</option><option>Orchard</option><option>Mixed farm</option></select></label></div></div>}
                    {step === 2 && <div className="field-assistant-form-step"><div className="field-assistant-form-intro"><span>03 / Crop Information</span><h2>What does this farmer grow?</h2><p>Add the current crops so the support team can follow up with context.</p></div><div className="field-assistant-form-grid"><label className="field-assistant-form-wide"><span>Primary Crops <b>*</b></span><input value={form.crops} onChange={(event) => update('crops', event.target.value)} placeholder="Tomato, rice, chili" required/></label><label><span>Language Preference <b>*</b></span><select value={form.language} onChange={(event) => update('language', event.target.value)}><option>English</option><option>Hindi</option><option>Telugu</option><option>Tamil</option></select></label><label><span>Crop Notes</span><input value={form.crop_notes} onChange={(event) => update('crop_notes', event.target.value)} placeholder="Optional notes"/></label></div></div>}
                    {step === 3 && <div className="field-assistant-form-step"><div className="field-assistant-form-intro"><span>04 / Review</span><h2>Review Farmer Details</h2><p>Check the information before adding this farmer to your team.</p></div><div className="field-assistant-review-grid">{[['Farmer Name', form.full_name], ['Mobile Number', form.phone], ['Village', form.village], ['Address', form.address], ['Farm Size', form.farm_size], ['Farm Type', form.farm_type], ['Primary Crops', form.crops], ['Language', form.language]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || 'Not provided'}</strong></div>)}</div></div>}
                    {state.error && <p className="field-assistant-form-error" role="alert">{state.error}</p>}{state.success && <div className="field-assistant-form-success" role="status"><CheckCircle2 size={18}/><div><strong>{state.success}</strong><p>The farmer is now available in your assigned farmer list.</p></div><button type="button" onClick={() => navigate('/field-assistant/farmers')}>View My Farmers <ArrowRight size={14}/></button></div>}
                    {!state.success && <div className="field-assistant-form-actions"><button type="button" className="field-assistant-secondary-button" onClick={() => step === 0 ? navigate('/field-assistant/farmers') : setStep((current) => current - 1)}>{step === 0 ? <ArrowLeft size={15}/> : <ArrowLeft size={15}/>} {step === 0 ? 'Cancel' : 'Back'}</button><button type="submit" className="field-assistant-primary-button" disabled={!canContinue || state.saving}>{state.saving ? <LoaderCircle size={15} className="field-assistant-spin"/> : step === 3 ? <Check size={15}/> : <ArrowRight size={15}/>} {state.saving ? 'Registering...' : step === 3 ? 'Register Farmer' : 'Next'}</button></div>}
                </form>
            </section>
        </div>
    </main>;
}

function FieldAssistantFarmersPage({ farmers, loading, navigate }) {
    const [search, setSearch] = useState('');
    const [village, setVillage] = useState('ALL');
    const normalizedFarmers = farmers.map((assignment) => ({
        ...assignment,
        ...(assignment.farmer || {}),
        name: assignment.farmer?.full_name || assignment.name || `Farmer #${assignment.farmer_id || assignment.id}`,
        village: assignment.farmer?.profile_data?.village || assignment.farmer?.village || assignment.village || assignment.location || 'Village not set',
        phone: assignment.farmer?.phone || assignment.phone || 'Phone not set',
    }));
    const villages = [...new Set(normalizedFarmers.map((farmer) => farmer.village))].sort();
    const visibleFarmers = normalizedFarmers.filter((farmer) => `${farmer.name} ${farmer.village} ${farmer.phone}`.toLowerCase().includes(search.trim().toLowerCase()) && (village === 'ALL' || farmer.village === village));
    return <main className="field-assistant-page field-assistant-farmers-page">
        <div className="field-assistant-container">
            <header className="field-assistant-topline"><span><Users size={13}/> Field Assistant / My Farmers</span><span>{normalizedFarmers.length} active farmers</span></header>
            <section className="field-assistant-heading"><div><p className="field-assistant-kicker">Farmer management</p><h1>My Farmers</h1><p>Keep every assigned farmer, crop, and follow-up in view.</p></div><button type="button" className="field-assistant-primary-button" onClick={() => navigate('/field-assistant/register-farmer')}><UserPlus size={15}/> Register Farmer</button></section>
            <section className="field-assistant-farmer-toolbar"><label><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search farmer by name or ID..." aria-label="Search farmers"/></label><label className="field-assistant-select"><SlidersHorizontal size={14}/><select value={village} onChange={(event) => setVillage(event.target.value)} aria-label="Filter farmers by village"><option value="ALL">All Villages</option>{villages.map((item) => <option value={item} key={item}>{item}</option>)}</select></label><span>{visibleFarmers.length} farmers</span></section>
            {loading && <div className="field-assistant-loading"><LoaderCircle size={19} className="field-assistant-spin"/> Loading your farmers...</div>}
            {!loading && <section className="field-assistant-farmer-grid">{visibleFarmers.map((farmer, index) => <article className="field-assistant-farmer-card" key={`${farmer.id}-${farmer.farmer_id || index}`}><div className="field-assistant-farmer-card-head"><img src={farmer.avatar || farmer.profile_data?.avatar || getProductImage({ name: 'farmer' })} alt=""/><span className="field-assistant-status-dot"/><button type="button" aria-label={`Open options for ${farmer.name}`}>•••</button></div><h2>{farmer.name}</h2><p className="field-assistant-farmer-id">FD-{String(farmer.farmer_id || farmer.id).padStart(4, '0')}</p><p className="field-assistant-farmer-detail"><MapPin size={13}/>{farmer.village}</p><p className="field-assistant-farmer-detail"><Phone size={13}/>{farmer.phone}</p><div className="field-assistant-farmer-tags"><span>{farmer.crop || 'Produce'}</span><span>{farmer.status || 'ACTIVE'}</span></div><Link to="/field-assistant/add-produce"><Wheat size={13}/> Manage produce</Link></article>)}{visibleFarmers.length === 0 && <div className="field-assistant-empty"><UserRound size={28}/><h2>No farmers found</h2><p>Try a different search or register a farmer for your field team.</p><button type="button" className="field-assistant-primary-button" onClick={() => navigate('/field-assistant/register-farmer')}><UserPlus size={15}/> Register Farmer</button></div>}</section>}
        </div>
    </main>;
}

export default function FieldAssistantPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const firstName = (user.full_name || 'Ravi').split(/\s+/)[0];
    const [farmers, setFarmers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [farmerId, setFarmerId] = useState('');
    const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });

    const demoFarmers = [
        { id: 'demo-1', name: 'Ramesh Kumar', village: 'Guntur', crop: 'Tomato', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80' },
        { id: 'demo-2', name: 'Lakshmi Devi', village: 'Vijayawada', crop: 'Rice', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
        { id: 'demo-3', name: 'Suresh Babu', village: 'Tenali', crop: 'Chili', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
    ];
    const demoProducts = [
        { id: 'tomato', name: 'Tomato', crop: 'Tomato', quantity: 35, unit: '%', image_url: '' },
        { id: 'chili', name: 'Chili', crop: 'Chili', quantity: 25, unit: '%', image_url: '' },
        { id: 'rice', name: 'Rice', crop: 'Rice', quantity: 20, unit: '%', image_url: '' },
        { id: 'onion', name: 'Onion', crop: 'Onion', quantity: 12, unit: '%', image_url: '' },
        { id: 'other', name: 'Others', crop: 'Other', quantity: 8, unit: '%', image_url: '' },
    ];

    async function load() {
        setState((current) => ({ ...current, loading: true, error: '' }));
        const [farmerResult, productResult, orderResult, notificationResult] = await Promise.allSettled([
            getPartnerRecords('field-assistant/farmers'),
            getProducts(),
            getOrders(),
            getNotifications(),
        ]);
        const farmerItems = farmerResult.status === 'fulfilled' ? farmerResult.value.items || [] : [];
        const productItems = productResult.status === 'fulfilled' ? productResult.value.products || productResult.value.items || [] : [];
        const orderItems = orderResult.status === 'fulfilled' ? orderResult.value.orders || orderResult.value.items || [] : [];
        const notificationItems = notificationResult.status === 'fulfilled' ? notificationResult.value.items || [] : [];
        setFarmers(farmerItems.length ? farmerItems : demoFarmers);
        setProducts(productItems.length ? productItems : demoProducts);
        setOrders(orderItems);
        setNotifications(notificationItems);
        setState((current) => ({ ...current, loading: false, error: farmerResult.status === 'rejected' ? 'Live farmer data unavailable. Showing demo signals.' : '' }));
    }

    useEffect(() => { load(); }, []);

    if (location.pathname === '/field-assistant/add-produce') {
        return <FieldAssistantAddProducePage farmers={farmers}/>;
    }

    if (location.pathname === '/field-assistant/inventory') {
        return <FieldAssistantInventoryPage farmers={farmers}/>;
    }

    if (location.pathname === '/field-assistant/orders') {
        return <FieldAssistantOrdersPage/>;
    }

    if (location.pathname === '/field-assistant/sales') {
        return <FieldAssistantSalesPage/>;
    }

    if (location.pathname === '/field-assistant/ai-demand') {
        return <FieldAssistantDemandPage/>;
    }

    if (location.pathname === '/field-assistant/settings') {
        return <FieldAssistantSettingsPage/>;
    }

    if (location.pathname === '/field-assistant/register-farmer') {
        return <FieldAssistantRegisterFarmerPage/>;
    }

    if (location.pathname === '/field-assistant/farmers') {
        return <FieldAssistantFarmersPage farmers={farmers} loading={state.loading} navigate={navigate}/>;
    }

    async function registerFarmer(event) {
        event.preventDefault();
        if (!farmerId.trim()) return;
        setState((current) => ({ ...current, saving: true, error: '', message: '' }));
        try {
            await createPartnerRecord('field-assistant/farmers', { farmer_id: Number(farmerId) });
            setFarmerId('');
            setState((current) => ({ ...current, saving: false, message: 'Farmer added to your field team.' }));
            await load();
        } catch (requestError) {
            setState((current) => ({ ...current, saving: false, error: requestError instanceof Error ? requestError.message : 'Unable to register farmer.' }));
        }
    }

    const topCrops = useMemo(() => {
        const liveCrops = products.reduce((summary, product) => {
            const crop = product.crop || product.name || 'Other';
            summary[crop] = (summary[crop] || 0) + Number(product.quantity || 0);
            return summary;
        }, {});
        const total = Object.values(liveCrops).reduce((sum, value) => sum + value, 0);
        if (!total) return demoProducts;
        return Object.entries(liveCrops).sort(([, first], [, second]) => second - first).slice(0, 5).map(([crop, value]) => ({ name: crop, crop, quantity: Math.round((value / total) * 100), unit: '%' }));
    }, [products]);

    const activity = notifications.slice(0, 3).map((item) => ({ title: item.title, detail: item.message, time: 'Recent', Icon: Bell }));
    if (!activity.length) {
        activity.push({ title: 'New farmer added', detail: 'Your field team is ready for updates.', time: '2 hours ago', Icon: UserPlus });
        activity.push({ title: 'Payment received', detail: 'A farmer payment was recorded.', time: '4 hours ago', Icon: Wallet });
        activity.push({ title: 'Harvest update completed', detail: 'Crop information is up to date.', time: 'Yesterday', Icon: CheckCircle2 });
    }

    return <main className="field-assistant-page">
        <div className="field-assistant-container">
            <header className="field-assistant-topline"><span><Users size={13}/> Field Assistant / Dashboard</span><span>Last synced just now</span></header>
            <section className="field-assistant-heading">
                <div><p className="field-assistant-kicker">Field Assistant Dashboard</p><h1>Hello {firstName}! <span aria-hidden="true">👋</span></h1><p>Here’s what’s happening with your farmers today.</p></div>
                <div className="field-assistant-heading-actions"><button type="button" className="field-assistant-icon-button" onClick={load} aria-label="Refresh dashboard"><RefreshCw size={16} className={state.loading ? 'field-assistant-spin' : ''}/></button><button type="button" className="field-assistant-icon-button" onClick={() => navigate('/field-assistant/notifications')} aria-label="Open notifications"><Bell size={16}/>{notifications.some((item) => !item.is_read) && <i/>}</button></div>
            </section>
            {state.error && <p className="field-assistant-notice" role="status">{state.error}</p>}
            {state.message && <p className="field-assistant-success" role="status"><CheckCircle2 size={15}/>{state.message}</p>}
            <section className="field-assistant-stats">
                <article><span>Total Farmers</span><strong>{farmers.length || 12}</strong><small><b>+2</b> new</small><Users size={20}/></article>
                <article><span>Total Products Listed</span><strong>{products.length || 48}</strong><small><b>+8</b> this week</small><Wheat size={20}/></article>
                <article><span>Pending Orders</span><strong>{orders.filter((order) => order.status === 'PENDING').length || 5}</strong><small><b className="field-assistant-orange">3</b> completed</small><ClipboardList size={20}/></article>
                <article><span>Total Sales</span><strong>₹ 48,250</strong><small><b>+12%</b> this week</small><Wallet size={20}/></article>
            </section>
            <div className="field-assistant-dashboard-grid">
                <section className="field-assistant-help-panel"><div><span className="field-assistant-panel-label">Support your farmers</span><h2>Help Farmers Grow</h2><p>Your support makes a big difference in their success.</p><Link to="/field-assistant/farmers">View all farmers <span>→</span></Link></div><img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" alt="Farmer working in a green field"/></section>
                <section className="field-assistant-panel field-assistant-crops"><div className="field-assistant-panel-heading"><div><span className="field-assistant-panel-label">Overview</span><h2>Top Crops</h2></div><Wheat size={17}/></div>{topCrops.map((crop) => <div className="field-assistant-crop-row" key={crop.name}><img src={getProductImage(crop)} alt=""/><span>{crop.name}</span><i><b style={{ width: `${Math.max(Number(crop.quantity), 8)}%` }}/></i><strong>{crop.quantity}%</strong></div>)}</section>
                <section className="field-assistant-panel field-assistant-activity"><div className="field-assistant-panel-heading"><div><span className="field-assistant-panel-label">Timeline</span><h2>Recent Activities</h2></div><Link to="/field-assistant/notifications">View all</Link></div>{activity.map(({ title, detail, time, Icon }) => <div className="field-assistant-activity-row" key={`${title}-${time}`}><span><Icon size={15}/></span><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></div>)}</section>
                <section className="field-assistant-panel field-assistant-actions"><div className="field-assistant-panel-heading"><div><span className="field-assistant-panel-label">Quick actions</span><h2>Keep the field moving</h2></div><Plus size={17}/></div><div className="field-assistant-action-grid"><Link to="/field-assistant/register-farmer"><UserPlus size={17}/><span>Register Farmer</span></Link><Link to="/field-assistant/add-produce"><Wheat size={17}/><span>Add Produce</span></Link><Link to="/field-assistant/inventory"><ClipboardList size={17}/><span>View Inventory</span></Link><Link to="/field-assistant/orders"><Wallet size={17}/><span>Track Orders</span></Link></div></section>
            </div>
            {(location.pathname === '/field-assistant/register-farmer' || location.pathname === '/field-assistant/farmers') && <section className="field-assistant-register-panel"><div><span className="field-assistant-panel-label">Farmer management</span><h2>{location.pathname.endsWith('farmers') ? 'My Farmers' : 'Register Farmer'}</h2><p>Enter a farmer account ID to add them to your active field team.</p></div><form onSubmit={registerFarmer}><label htmlFor="field-farmer-id">Farmer ID</label><input id="field-farmer-id" type="number" min="1" value={farmerId} onChange={(event) => setFarmerId(event.target.value)} placeholder="e.g. 1042" required/><button type="submit" disabled={state.saving}>{state.saving ? <LoaderCircle size={15}/> : <UserPlus size={15}/>} {state.saving ? 'Adding...' : 'Add farmer'}</button></form><div className="field-assistant-farmer-chips">{farmers.slice(0, 6).map((farmer, index) => <span key={farmer.id}><img src={farmer.avatar || getProductImage({ name: 'farmer' })} alt=""/>{farmer.name || `Farmer #${farmer.farmer_id || index + 1}`}</span>)}</div></section>}
        </div>
    </main>;
}
