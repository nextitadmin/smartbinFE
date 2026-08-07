
import { lazy, Suspense } from "react";

import LoadingComponent from "../components/LoadingComponent";


const HomePage = lazy(() => import("../agent/HomePage"));
const AppManager = lazy(() => import("../agent/ApplicationManager"));
const BillConfirm = lazy(() => import("../agent/Billconfirm"));
const NewKycApplication = lazy(() => import("../agent/NewKYCApplication"));
const ApplyForSmartBinForm = lazy(() => import("../agent/ApplyForSmartBinForm"));
const KYCApplication = lazy(() => import("../agent/AgentKYCApplicationForm"));
const Headless = lazy(() => import("../agent/ApplyForSmartBinFormHeadless"));
const Bills = lazy(() => import("../agent/Bills"));
const Wastes = lazy(() => import("../agent/Wastes"));
const Wallet = lazy(() => import("../agent/Wallet"));
const PaymentReceipts = lazy(() => import("../agent/PaymentsReceipts"));
const PaymentHistory = lazy(() => import("../agent/Payments"));
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const Reports = lazy(() => import("../agent/Reports"));
const ServiceConfiguration = lazy(() => import('../agent/ServiceConfiguration'))
const NotificationsPage = lazy(() => import('../agent/Notifications'))
const HelpAndSupportPage = lazy(() => import('../agent/HelpAndSupport'))
const CLientPreferences = lazy(() => import('../agent/ClientPreferences'))
const PaymentsReport = lazy(() => import('../agent/PaymentsReport'))
const SmartBinReport = lazy(() => import('../agent/SmartBinReport'))
const Receipt = lazy(() => import('../agent/Receipt'))
const UserManagement = lazy(() => import('../agent/UserManagement'));
const TeamMembers = lazy(() => import('../agent/TeamMembers'));
const ViewBill = lazy(() => import('../agent/BillView'));

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
    // {
    //     path: "/bills",
    //     element: (
    //         <Suspense fallback={<LoadingComponent />}>
    //             <ProtectedRoute>
    //                 <Bills />
    //             </ProtectedRoute>
    //         </Suspense>
    //     ),
    // },
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