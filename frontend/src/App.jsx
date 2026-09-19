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
import BulkBuyerDashboardPage from './pages/partners/BulkBuyerDashboardPage';
import BulkBuyerRequirementsPage from './pages/partners/BulkBuyerRequirementsPage';
import BulkBuyerMatchingPage from './pages/partners/BulkBuyerMatchingPage';
import BulkBuyerAnalyticsPage from './pages/partners/BulkBuyerAnalyticsPage';
import BulkBuyerLogisticsPage from './pages/consumer/BulkBuyerLogisticsPage';
import BulkBuyerPaymentsPage from './pages/consumer/BulkBuyerPaymentsPage';
import BulkBuyerRoleShell from './components/layout/BulkBuyerRoleShell';
import FieldAssistantPage, { FieldAssistantNotificationsPage, FieldAssistantProfilePage } from './pages/fieldAssistant/FieldAssistantPage';
import MarketplacePage from './pages/consumer/MarketplacePage';
import CartPage from './pages/consumer/CartPage';
import OrdersPage from './pages/consumer/OrdersPage';
import BulkBuyerOrdersPage from './pages/consumer/BulkBuyerOrdersPage';
import TrackingPage from './pages/consumer/TrackingPage';
import NotificationsPage from './pages/consumer/NotificationsPage';
import PaymentsPage from './pages/consumer/PaymentsPage';
import ReviewPage from './pages/consumer/ReviewPage';
import ProductDetailsPage from './pages/consumer/ProductDetailsPage';
import WishlistPage from './pages/consumer/WishlistPage';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import ContactPage from './pages/public/ContactPage';
import RouteEstimatePage from './pages/logistics/RouteEstimatePage';
import LogisticsFeaturePage from './pages/logistics/LogisticsFeaturePage';
import DashboardShell from './components/layout/DashboardShell';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import FarmerFarmPage from './pages/farmer/FarmerFarmPage';
import FarmerEarningsPage from './pages/farmer/FarmerEarningsPage';
import FarmerInsightsPage from './pages/farmer/FarmerInsightsPage';
import FarmerTrackingPage from './pages/farmer/FarmerTrackingPage';
import FarmerSettingsPage from './pages/farmer/FarmerSettingsPage';
import FpoSettingsPage from './pages/partners/FpoSettingsPage';
import LogisticsProfilePage from './pages/logistics/LogisticsProfilePage';
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
        <Route element={<ProtectedRoute roles={['bulk_buyer']}/>}><Route path="/dashboard/bulk-buyer" element={<BulkBuyerDashboardPage />}/></Route>
        <Route element={<ProtectedRoute roles={['bulk_buyer']}/>}><Route path="/bulk-buyer/requirements" element={<BulkBuyerRequirementsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['bulk_buyer']}/>}><Route path="/bulk-buyer/matching" element={<BulkBuyerMatchingPage />}/></Route>
        <Route element={<ProtectedRoute roles={['bulk_buyer']}/>}><Route path="/bulk-buyer/analytics" element={<BulkBuyerAnalyticsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['bulk_buyer']}/>}><Route path="/bulk-buyer/logistics" element={<BulkBuyerLogisticsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['bulk_buyer', 'consumer']}/>}><Route element={<BulkBuyerRoleShell />}>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/bulk-buyer/settings" element={<ProfilePage />}/>
          <Route path="/marketplace" element={<MarketplacePage />}/><Route path="/products/:productId" element={<ProductDetailsPage />}/><Route path="/cart" element={<CartPage />}/><Route path="/orders" element={<BulkBuyerOrdersPage />}/><Route path="/orders/:orderId/tracking" element={<TrackingPage />}/><Route path="/tracking" element={<TrackingPage />}/><Route path="/tracking/:orderId" element={<TrackingPage />}/><Route path="/notifications" element={<NotificationsPage />}/><Route path="/payments" element={<BulkBuyerPaymentsPage />}/><Route path="/wishlist" element={<WishlistPage />}/><Route path="/review" element={<ReviewPage />}/><Route path="/reviews" element={<ReviewPage />}/>
        </Route></Route>
        <Route element={<DashboardShell />}>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route element={<ProtectedRoute roles={['logistics_provider']}/>}><Route path="/logistics/profile" element={<LogisticsProfilePage />}/></Route>
          <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/farmer/profile" element={<ProfilePage />}/></Route>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/dashboard/farmer" element={<FarmerDashboardPage />}/></Route>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/farmer/products" element={<FarmerProductsPage />}/><Route path="/farmer/add-product" element={<FarmerProductsPage />}/><Route path="/farmer/inventory" element={<FarmerProductsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/farmer/orders" element={<FarmerOrdersPage />}/></Route>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/farmer/farm" element={<FarmerFarmPage />}/><Route path="/farmer/earnings" element={<FarmerEarningsPage />}/><Route path="/farmer/notifications" element={<NotificationsPage />}/><Route path="/farmer/tracking" element={<FarmerTrackingPage />}/><Route path="/farmer/settings" element={<FarmerSettingsPage />}/><Route path="/farmer/orders/:orderId/tracking" element={<TrackingPage />}/></Route>
        <Route element={<ProtectedRoute roles={['farmer']}/>}><Route path="/farmer/insights" element={<FarmerInsightsPage />}/><Route path="/farmer/ai-price" element={<FarmerInsightsPage />}/><Route path="/farmer/ai-demand" element={<FarmerInsightsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['consumer']}/>}><Route path="/dashboard/consumer" element={<ConsumerDashboardPage />}/></Route>
        <Route element={<ProtectedRoute roles={['consumer']}/>}><Route path="/marketplace" element={<MarketplacePage />}/><Route path="/products/:productId" element={<ProductDetailsPage />}/><Route path="/cart" element={<CartPage />}/><Route path="/orders" element={<OrdersPage />}/><Route path="/orders/:orderId/tracking" element={<TrackingPage />}/><Route path="/tracking" element={<TrackingPage />}/><Route path="/tracking/:orderId" element={<TrackingPage />}/><Route path="/notifications" element={<NotificationsPage />}/><Route path="/payments" element={<PaymentsPage />}/><Route path="/wishlist" element={<WishlistPage />}/><Route path="/review" element={<ReviewPage />}/><Route path="/reviews" element={<ReviewPage />}/></Route>
        <Route element={<ProtectedRoute roles={['admin']}/>}><Route path="/dashboard/admin" element={<AdminDashboardPage />}/><Route path="/admin/profile" element={<ProfilePage />}/></Route>
        <Route element={<ProtectedRoute roles={['admin']}/>}><Route path="/admin/users" element={<AdminUsersPage />}/><Route path="/admin/products" element={<AdminProductsPage />}/><Route path="/admin/orders" element={<AdminOrdersPage />}/><Route path="/admin/audit-logs" element={<AdminAuditLogsPage />}/></Route>
        <Route element={<ProtectedRoute roles={['logistics_provider']}/>}><Route path="/dashboard/logistics" element={<LogisticsDashboardPage />}/></Route>
          <Route element={<ProtectedRoute roles={['logistics_provider', 'admin']}/>}><Route path="/logistics/route-estimate" element={<RouteEstimatePage />}/><Route path="/logistics/routes" element={<RouteEstimatePage />}/></Route>
          <Route element={<ProtectedRoute roles={['logistics_provider']}/>}><Route path="/logistics/deliveries" element={<LogisticsFeaturePage />}/><Route path="/logistics/my-deliveries" element={<LogisticsFeaturePage />}/><Route path="/logistics/vehicles" element={<LogisticsFeaturePage />}/><Route path="/logistics/drivers" element={<LogisticsFeaturePage />}/><Route path="/logistics/tracking" element={<LogisticsFeaturePage />}/><Route path="/logistics/earnings" element={<LogisticsFeaturePage />}/><Route path="/logistics/notifications" element={<LogisticsFeaturePage />}/><Route path="/logistics/settings" element={<LogisticsFeaturePage />}/></Route>
        <Route element={<ProtectedRoute roles={['fpo']}/>}><Route path="/dashboard/fpo" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/members" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/farmers" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/inventory" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/aggregations" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/marketplace" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/bulk-buyers" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/logistics" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/analytics" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/notifications" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/settings" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/profile" element={<PartnerDashboardPage role="fpo"/>}/><Route path="/fpo/:section" element={<PartnerDashboardPage role="fpo"/>}/></Route>
        <Route element={<ProtectedRoute roles={['field_assistant']}/>}><Route path="/dashboard/field-assistant" element={<FieldAssistantPage />}/><Route path="/field-assistant/farmers" element={<FieldAssistantPage />}/><Route path="/field-assistant/register-farmer" element={<FieldAssistantPage />}/><Route path="/field-assistant/add-produce" element={<FieldAssistantPage />}/><Route path="/field-assistant/inventory" element={<FieldAssistantPage />}/><Route path="/field-assistant/orders" element={<FieldAssistantPage />}/><Route path="/field-assistant/sales" element={<FieldAssistantPage />}/><Route path="/field-assistant/ai-demand" element={<FieldAssistantPage />}/><Route path="/field-assistant/notifications" element={<FieldAssistantNotificationsPage />}/><Route path="/field-assistant/profile" element={<FieldAssistantProfilePage />}/><Route path="/field-assistant/settings" element={<FieldAssistantPage />}/><Route path="/field-assistant/support" element={<FieldAssistantPage />}/></Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />}/>
    </Routes>);
}
export default App;
