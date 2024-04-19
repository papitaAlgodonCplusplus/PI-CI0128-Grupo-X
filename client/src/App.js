import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Login from "./pages/Login"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Rooms from "./pages/Rooms"
import Details from "./pages/Details"
import Payment from "./pages/Payment.jsx";
import Reservation from "./pages/Reservation.jsx";
import Amenities from "./pages/Amenities.jsx";
import ReservationsList from "./pages/ReservationsList.jsx"
import ReservationsAdmin from "./pages/ReservationsAdmin.jsx";
import { Provider } from './Context.js';
import { AuthProvider } from './AuthContext';

const Layout = () => {
  return (
    <>
      <Navbar />,
      <Outlet />,
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/rooms",
        element: <Rooms />,
      },
      {
        path: "/details",
        element: <Details />,
      },
      {
        path: "/reservation",
        element: <Reservation />,
      },
      {
        path: "/pay",
        element: <Payment />,
      },
      {
        path: "/amenities",
        element: <Amenities />,
      },
      {
        path: "/reservations_list",
        element: <ReservationsList />,
      },
      {
        path: "/reservations_admin",
        element: <ReservationsAdmin />
      }
    ]
  }
]);


function App() {
  return (
    <AuthProvider>
      <Provider>
        <div className="app">
          <div className="container">
            <div>
              <RouterProvider router={router} />
            </div>
          </div>
        </div>
      </Provider>
    </AuthProvider>
  );
}

export default App;