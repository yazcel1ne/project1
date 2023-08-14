import React, { Suspense, lazy, useEffect, useState }from "react";
import { createBrowserRouter } from "react-router-dom";
//utility pages
import NotFound from "./pages/NotFound/NotFound";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import Loading from "./pages//LoadingPage/LoadingPage";
import PrintPurchaseOrders from "./components/PurchaseOrders/PrintPurchaseOrders";
import PrintPurchaseRequest from "./components/PurchaseRequests/PrintPurchaseRequest";

//layout
const GuestLayout = lazy(() => import("./layouts/GuestLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
//pages
const Login = lazy(() => import("./pages/Login/Login"));
const ForgotPassword = lazy(() => import("./pages/Password/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Password/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Users = lazy(() => import("./pages/Users/Users"));
const Items = lazy(() => import("./pages/Items/Items"));
const CreatePurchaseRequest = lazy(() => import("./components/PurchaseRequests/CreatePurchaseRequest"));
const PurchaseRequests = lazy(() => import("./pages/PurchaseRequests/PurchaseRequests"));
const PurchaseOrders = lazy(() => import("./pages/PurchaseOrders/PurchaseOrders"));
const RolesAndPermissions = lazy(() =>
  import("./pages/RolesAndPermissions/RolesAndPermissions")
);
const Report = lazy(() => import("./pages/Report/Report"));
const Categories = lazy(() => import("./pages/Categories/Categories"));
const Units = lazy(() => import("./pages/Units/Units"));
const Menus = lazy(() => import("./pages/Menus/Menu"));
//datagrids
const RequestDatagrid = lazy(() => import("./pages/RequestDataGrid/RequestDataGrid"));
const ViewPurchaseOrders = lazy(() =>
  import("./components/PurchaseOrders/ViewPurchaseOrders")
);

//permissions 
import { Permissions } from "./constants/Permissions";
import { checkPermission } from "./config/api"

const ProtectedRoute = ({ permission, Component, UnauthorizedComponent }) =>{
    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
  
    useEffect(() => {
      async function checkAccess() {
        const response = await checkPermission({ permission });
        if (response.ok) {
          setHasAccess(response.data.hasPermission);
        }
         else {
          console.error("Permission check failed:", response.error);
        }
        setIsLoading(false);
      }
  
      checkAccess();
    }, [permission]);

    if (isLoading) {
      return <Loading />;
    }
  
    return hasAccess ? <Component /> : <UnauthorizedComponent />;
  };


const Router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <GuestLayout />
      </Suspense>
    ),
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        path: "/dashboard",
        element:<ProtectedRoute
        permission={Permissions.CAN_ACCESS_DASHBOARD}
        Component={Dashboard}
        UnauthorizedComponent={Unauthorized}
      />
      },
      {
        path: "/items",
        element: <ProtectedRoute
        permission={Permissions.CAN_ACCESS_ITEMS}
        Component={Items}
        UnauthorizedComponent={Unauthorized}
      />
      },
      {
        path: "/categories",
        element: <ProtectedRoute
        permission={Permissions.CAN_ACCESS_CATEGORIES}
        Component={Categories}
        UnauthorizedComponent={Unauthorized}
      />
      },
      {
        path: "/units",
        element: <ProtectedRoute
        permission={Permissions.CAN_ACCESS_UNITS}
        Component={Units}
        UnauthorizedComponent={Unauthorized}
      />
      },
      {
        path: "/purchase-requests",
        element: <ProtectedRoute
        permission={Permissions.CAN_ACCESS_PURCHASE_REQUESTS}
        Component={PurchaseRequests}
        UnauthorizedComponent={Unauthorized}
      />,
      },
      {
        path: "/purchase-orders",
        element:<ProtectedRoute
        permission={Permissions.CAN_ACCESS_PURCHASE_ORDERS}
        Component={PurchaseOrders}
        UnauthorizedComponent={Unauthorized}
      />, 
      },
      {
        path: "/users",
        element:  <ProtectedRoute
        permission={Permissions.CAN_ACCESS_USERS}
        Component={Users}
        UnauthorizedComponent={Unauthorized}
      />, 
      },
      {
        path: "/roles-and-permissions",
        element: <ProtectedRoute
        permission={Permissions.CAN_VIEW_ROLE_PERMISSION}
        Component={RolesAndPermissions}
        UnauthorizedComponent={Unauthorized}
      />, 
      },
      {
        path: "/request-data-grid",
        element:  <ProtectedRoute
        permission={Permissions.CAN_ACCESS_PURCHASE_REQUESTS}
        Component={RequestDatagrid}
        UnauthorizedComponent={Unauthorized}
      />, 
      },
      {
        path: "/orders-data-grid",
        element:  <ProtectedRoute
        permission={Permissions.CAN_ACCESS_PURCHASE_ORDERS}
        Component={ViewPurchaseOrders}
        UnauthorizedComponent={Unauthorized}
      />, 
      },
      {
        path: "/report-list",
        element: <ProtectedRoute
        permission={Permissions.CAN_ACCESS_REPORTS}
        Component={Report}
        UnauthorizedComponent={Unauthorized}
      />, 
      },
      {
        path: "/create-requests",
        element: <ProtectedRoute
        permission={Permissions.CAN_CREATE_PURCHASE_REQUESTS}
        Component={CreatePurchaseRequest}
        UnauthorizedComponent={Unauthorized}
      />, 
      },
      {
        path: "/menus",
        element: <ProtectedRoute
        permission={Permissions.CAN_ACCESS_MENU}
        Component={Menus}
        UnauthorizedComponent={Unauthorized}
        />, 
      },

    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },

  {
    path: "/Unauthorized",
    element: <Unauthorized />,
  },

  {
    path: "/print-orders",
    element: <PrintPurchaseOrders />,
  },
  {
    path: "/print-purchase-request",
    element: <PrintPurchaseRequest/>,
  },
]);

export default Router;
