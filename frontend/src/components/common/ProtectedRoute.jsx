import { Navigate, Outlet, useLocation } from 'react-router-dom';
export default function ProtectedRoute({ roles }) {
    const location = useLocation();
    const token = localStorage.getItem('farmdirect_token');
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    if (!token)
        return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
    if (roles && !roles.includes(user.role || ''))
        return <Navigate to="/" replace/>;
    return <Outlet />;
}
