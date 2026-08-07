// components/RouterWrapper.jsx
import React, { Suspense, lazy, useState, useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import useRouteStore from "../store/routeStore";
import agentRoutes from "./agentRoutes";
import residentRoutes from "./residentRoutes";
import facilityManager from "./facilityManagerRoutes";
import corporateRoutes from "./corporateRoutes";
import LoadingComponent from "../components/LoadingComponent";


// Lazy-loaded pages with error handling
const Confirmation = lazy(() =>
  import("../pages/Confirmation").catch(() => import("../pages/404"))
);

const CreatePayerID = lazy(() =>
  import("../pages/CreatePayerId").catch(() => import("../pages/404"))
);
const ResidentOnboard = lazy(() =>
  import("../pages/ResidentOnboardForm").catch(() => import("../pages/404"))
);
const AgentOnboard = lazy(() =>
  import("../pages/AgentOnboardForm").catch(() => import("../pages/404"))
);
const AgentCreatePayerID = lazy(() =>
  import("../pages/AgentCreatePayerId").catch(() => import("../pages/404"))
);
const Signup = lazy(() =>
  import("../pages/Signup").catch(() => import("../pages/404"))
);
const CreatePayerIdSuccess = lazy(() =>
  import("../pages/CreatePayerIdSuccess").catch(() => import("../pages/404"))
);
const AgentCreatePayerIdSuccess = lazy(() =>
  import("../pages/AgentCreatePayerIdSuccess").catch(() =>
    import("../pages/404")
  )
);
const PasswordOtp = lazy(() =>
  import("../pages/ConfirmPasswordOtp").catch(() => import("../pages/404"))
);
const ErrorPage = lazy(() => import("../pages/404"));
const Auth = lazy(() =>
  import("../pages/Auth").catch(() => import("../pages/404"))
);
const Success = lazy(() =>
  import("../pages/SuccessVerification").catch(() => import("../pages/404"))
);
const Forgot = lazy(() =>
  import("../pages/ForgotPassword").catch(() => import("../pages/404"))
);
const EnterNewPassword = lazy(() =>
  import("../pages/EnterNewPassword").catch(() => import("../pages/404"))
);
const PaymentSuccess = lazy(() =>
  import("../pages/PaymentSuccess").catch(() => import("../pages/404"))
);
const FacilityManagerOnboard = lazy(() =>
  import("../pages/FacilityMgrOnboard").catch(() => import("../pages/404"))
);
const FacilityMgrCreatePayerID = lazy(() =>
  import("../pages/FacilityMgrCreatePayerId").catch(() =>
    import("../pages/404")
  )
);
const FacilityMgrCreatePayerIdSuccess = lazy(() =>
  import("../pages/FacilityMgrCreatePayerIdSuccess").catch(() =>
    import("../pages/404")
  )
);
const CorporateOnboard = lazy(() =>
  import("../corporate/CorporateOnboardForm").catch(() => import("../pages/404"))
);

// Loading component


// Helper function to determine routes based on user type
const getRoutesForUserType = (userType) => {
  switch (userType) {
    case "agent":
      return agentRoutes;
    case "resident":
      return residentRoutes;
    case "facilitymgr":
      return facilityManager;
    case "corporate":
      return corporateRoutes;
    default:
      return [];
  }
};

export default function RouterWrapper() {
  const [router, setRouter] = useState(null);
  const [userType, setUserType] = useState(null);
  const dynamicRoutes = useRouteStore((state) => state.routes);


  // Initialize user type
  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    if (storedUserType) {
      setUserType(storedUserType);
    } else {
      localStorage.setItem("userType", "resident");
      setUserType("resident");
    }
  }, []);

  // Memoize static routes to prevent recreation on every render
  const staticRoutes = useMemo(
    () => [
      {
        path: "/",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <Auth />
          </Suspense>
        ),
      },
      {
        path: "/confirm",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <Confirmation />
          </Suspense>
        ),
      },
      {
        path: "/createpayerid",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <CreatePayerID />
          </Suspense>
        ),
      },
      {
        path: "/agentcreatepayerid",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <AgentCreatePayerID />
          </Suspense>
        ),
      },
      {
        path: "/createidsuccess",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <CreatePayerIdSuccess />
          </Suspense>
        ),
      },
      {
        path: "/agentcreateidsuccess",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <AgentCreatePayerIdSuccess />
          </Suspense>
        ),
      },
      {
        path: "/success",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <Success />
          </Suspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <Signup />
          </Suspense>
        ),
      },
      {
        path: "/agentonboard",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <AgentOnboard />
          </Suspense>
        ),
      },
      {
        path: "/corporateonboard",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <CorporateOnboard />
          </Suspense>
        ),
      },
      {
        path: "/facilitymanageronboard",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <FacilityManagerOnboard />
          </Suspense>
        ),
      },
      {
        path: "/facilitymgrcreatepayerid",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <FacilityMgrCreatePayerID />
          </Suspense>
        ),
      },
      {
        path: "/facilitymgrcreateidsuccess",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <FacilityMgrCreatePayerIdSuccess />
          </Suspense>
        ),
      },
      {
        path: "/residentonboard",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ResidentOnboard />
          </Suspense>
        ),
      },
      {
        path: "/resetpassword",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <Forgot />
          </Suspense>
        ),
      },
      {
        path: "/passwordotp",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <PasswordOtp />
          </Suspense>
        ),
      },
      {
        path: "/enternewpassword",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <EnterNewPassword />
          </Suspense>
        ),
      },
      {
        path: "/payment-success",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <PaymentSuccess />
          </Suspense>
        ),
      },
      {
        path: "/*",
        element: (
          <Suspense fallback={<LoadingComponent />}>
            <ErrorPage />
          </Suspense>
        ),
      },
    ],
    []
  );

  // Create router when dependencies change
  useEffect(() => {
    // Wait for userType to be initialized
    if (userType === null) return;

    // Determine which routes to use
    const userTypeRoutes =
      dynamicRoutes.length > 0 ? dynamicRoutes : getRoutesForUserType(userType);

    const fullRoutes = [...staticRoutes, ...userTypeRoutes];

    try {
      const newRouter = createBrowserRouter(fullRoutes);
      setRouter(newRouter);
    } catch (error) {
      console.error("Failed to create router:", error);
      // Fallback to error page
      const errorRouter = createBrowserRouter([
        {
          path: "*",
          element: (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorPage />
            </Suspense>
          ),
        },
      ]);
      setRouter(errorRouter);
    }

    // Add this at the top of your component for development logging
    const isDevelopment = true;

    // Then in the useEffect:
    if (isDevelopment) {
      console.log("Dynamic Routes:", userTypeRoutes);

    }
  }, [dynamicRoutes, userType, staticRoutes]);

  // Show loading state while router is being created
  if (!router || userType === null) {
    return <LoadingComponent />;
  }

  return <RouterProvider router={router} />;
}
