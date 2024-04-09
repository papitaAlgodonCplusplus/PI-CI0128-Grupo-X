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

const Layout = () => {
  return (
    <>
      <Navbar />,
      <Outlet />,
      <Footer />,
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
        path: "/login",
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
    ]
  },
]);


function App() {
  return (
    <div className="app">
      <div className="container">
        <div>
          <RouterProvider router={router} />
        </div>
      </div>
    </div>
  );
}

export default App;