
import { lazy, Suspense } from "react";
import LoadingComponent from "../components/LoadingComponent";


const HomePage = lazy(() => import("../facilityManager/HomePage"));
const AppManager = lazy(() => import("../facilityManager/ApplicationManager"));
const BillConfirm = lazy(() => import("../facilityManager/Billconfirm"));
const NewKycApplication = lazy(() => import("../facilityManager/NewKYCApplication"));
const ApplyForSmartBinForm = lazy(() => import("../facilityManager/ApplyForSmartBinForm"));
const KYCApplication = lazy(() => import("../facilityManager/AgentKYCApplicationForm"));
const Headless = lazy(() => import("../facilityManager/ApplyForSmartBinFormHeadless"));
const Bills = lazy(() => import("../facilityManager/Bills"));
const Wastes = lazy(() => import("../facilityManager/Wastes"));
const Wallet = lazy(() => import("../facilityManager/Wallet"));
const PaymentReceipts = lazy(() => import("../facilityManager/PaymentsReceipts"));
const PaymentHistory = lazy(() => import("../facilityManager/Payments"));
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const Reports = lazy(() => import("../facilityManager/Reports"));
const ServiceConfiguration = lazy(() => import('../facilityManager/ServiceConfiguration'))
const NotificationsPage = lazy(() => import('../facilityManager/Notifications'))
const HelpAndSupportPage = lazy(() => import('../facilityManager/HelpAndSupport'))
const CLientPreferences = lazy(() => import('../facilityManager/ClientPreferences'))
const PaymentsReport = lazy(() => import('../facilityManager/PaymentsReport'))
const SmartBinReport = lazy(() => import('../facilityManager/SmartBinReport'))
const Receipt = lazy(() => import('../facilityManager/Receipt'))
const UserManagement = lazy(() => import('../facilityManager/UserManagement'));
const MyFacilities = lazy(() => import('../facilityManager/MyFacilities'));
const TeamMembers = lazy(() => import('../facilityManager/TeamMembers'));
const ViewBill = lazy(() => import('../facilityManager/BillView'));
const agentRoutes = [
    {
        path: "/dashboard",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <HomePage />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/appmanager",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <AppManager />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/applyforsmartbin",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <ApplyForSmartBinForm />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/bills",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <Bills />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/view-bill",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <ViewBill />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/billconfirm",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <BillConfirm />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/headless",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <Headless />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/kycapplication",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <KYCApplication />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/newkycapplication",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <NewKycApplication />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/notifications-settings",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <NotificationsPage />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/payment-report",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <PaymentsReport />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/helpandSupport",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <HelpAndSupportPage />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/receipt",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <Receipt />
                </ProtectedRoute>
            </Suspense>
        ),
    },

    {
        path: "/reports",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <Reports />
                </ProtectedRoute>
            </Suspense>
        ),
    },

    {
        path: "/service",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <ServiceConfiguration />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/smartbinreport",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <SmartBinReport />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/client-preferences",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <CLientPreferences />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/wastes",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <Wastes />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/team-members",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <TeamMembers />
                </ProtectedRoute>
            </Suspense>
        ),
    },


    {
        path: "/payments",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <PaymentHistory />
                </ProtectedRoute>
            </Suspense>
        ),

    },
    {
        path: "/receipts",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <PaymentReceipts />
                </ProtectedRoute>
            </Suspense>
        ),
    },

    {
        path: "/user-management",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <UserManagement />
                </ProtectedRoute>
            </Suspense>
        ),
    },
    {
        path: "/my-facilities",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <MyFacilities />
                </ProtectedRoute>
            </Suspense>
        ),
    },

    {
        path: "/wallet",
        element: (
            <Suspense fallback={<LoadingComponent />}>
                <ProtectedRoute>
                    <Wallet />
                </ProtectedRoute>
            </Suspense>
        ),
    },
]

export default agentRoutes