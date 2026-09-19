import { Navigate, Outlet, useLocation } from 'react-router-dom';
export default function ProtectedRoute({ roles }) {
    const location = useLocation();
    const token = localStorage.getItem('farmdirect_token');
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    if (!token)
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    if (roles && !roles.includes(user.role || '')) {
        if (location.pathname === '/profile' && user.role === 'farmer')
            return <Navigate to="/farmer/profile" replace/>;
        if (location.pathname === '/profile' && user.role === 'fpo')
            return <Navigate to="/fpo/profile" replace/>;
        if (location.pathname === '/profile' && user.role === 'logistics_provider')
            return <Navigate to="/logistics/profile" replace/>;
        if (location.pathname === '/profile' && user.role === 'field_assistant')
            return <Navigate to="/field-assistant/profile" replace/>;
        if (location.pathname === '/profile' && user.role === 'admin')
            return <Navigate to="/admin/profile" replace/>;
        return <Navigate to="/" replace/>;
    }
    return <Outlet />;
}
