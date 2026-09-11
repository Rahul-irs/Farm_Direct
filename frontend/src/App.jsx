import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SelectRolePage from './pages/auth/SelectRolePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyResetCodePage from './pages/auth/VerifyResetCodePage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import FarmerDashboardPage from './pages/farmer/FarmerDashboardPage';
import ConsumerDashboardPage from './pages/consumer/ConsumerDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import NotFoundPage from './pages/public/NotFoundPage';
import ProfilePage from './pages/auth/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import FarmerProductsPage from './pages/farmer/FarmerProductsPage';
import LogisticsDashboardPage from './pages/logistics/LogisticsDashboardPage';
import PartnerDashboardPage from './pages/partners/PartnerDashboardPage';
import MarketplacePage from './pages/consumer/MarketplacePage';
import CartPage from './pages/consumer/CartPage';
import OrdersPage from './pages/consumer/OrdersPage';
import TrackingPage from './pages/consumer/TrackingPage';
import NotificationsPage from './pages/consumer/NotificationsPage';
import PaymentsPage from './pages/consumer/PaymentsPage';
import ReviewPage from './pages/consumer/ReviewPage';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import ContactPage from './pages/public/ContactPage';
import RouteEstimatePage from './pages/logistics/RouteEstimatePage';
import DashboardShell from './components/layout/DashboardShell';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
function App() {
    return (<Routes>
      <Route path="/" element={<LandingPage />}/>
      <Route path="/about" element={<AboutPage />}/>
      <Route path="/how-it-works" element={<HowItWorksPage />}/>
      <Route path="/contact" element={<ContactPage />}/>
      <Route path="/login" element={<LoginPage />}/>
      <Route path="/register" element={<RegisterPage />}/>
      <Route path="/select-role" element={<SelectRolePage />}/>
      <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
      <Route path="/verify-reset-code" element={<VerifyResetCodePage />}/>
      <Route path="/reset-password" element={<ResetPasswordPage />}/>
      <Route path="/verify-email" element={<VerifyEmailPage />}/>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/dashboard/farmer" element={<FarmerDashboardPage />}/></Route>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/farmer/products" element={<FarmerProductsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/farmer/orders" element={<FarmerOrdersPage />}/></Route>
        <Route element={<ProtectedRoute roles={['consumer']}/>}><Route path="/dashboard/consumer" element={<ConsumerDashboardPage />}/></Route>
        <Route element={<ProtectedRoute roles={['consumer', 'bulk_buyer']}/>}><Route path="/marketplace" element={<MarketplacePage />}/><Route path="/cart" element={<CartPage />}/><Route path="/orders" element={<OrdersPage />}/><Route path="/orders/:orderId/tracking" element={<TrackingPage />}/><Route path="/notifications" element={<NotificationsPage />}/><Route path="/payments" element={<PaymentsPage />}/><Route path="/review" element={<ReviewPage />}/></Route>
        <Route element={<ProtectedRoute roles={['admin']}/>}><Route path="/dashboard/admin" element={<AdminDashboardPage />}/></Route>
        <Route element={<ProtectedRoute roles={['admin']}/>}><Route path="/admin/users" element={<AdminUsersPage />}/><Route path="/admin/products" element={<AdminProductsPage />}/><Route path="/admin/orders" element={<AdminOrdersPage />}/><Route path="/admin/audit-logs" element={<AdminAuditLogsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['logistics_provider']}/>}><Route path="/dashboard/logistics" element={<LogisticsDashboardPage />}/></Route>
          <Route element={<ProtectedRoute roles={['logistics_provider', 'admin']}/>}><Route path="/logistics/route-estimate" element={<RouteEstimatePage />}/></Route>
        <Route element={<ProtectedRoute roles={['fpo']}/>}><Route path="/dashboard/fpo" element={<PartnerDashboardPage role="fpo"/>}/></Route>
        <Route element={<ProtectedRoute roles={['field_assistant']}/>}><Route path="/dashboard/field-assistant" element={<PartnerDashboardPage role="field_assistant"/>}/></Route>
        <Route element={<ProtectedRoute roles={['bulk_buyer']}/>}><Route path="/dashboard/bulk-buyer" element={<PartnerDashboardPage role="bulk_buyer"/>}/></Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />}/>
    </Routes>);
}
export default App;
