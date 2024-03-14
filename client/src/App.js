import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from "./pages/Login"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

const router = createBrowserRouter([
  {
    path: "/",
    element: 
    <div>
      <Navbar/>,
      <Home/>,
      <Footer/>,
    </div>
  },{
    path: "/login",
    element: <Login/>,
  },{
    path: "/register",
    element: <Register/>,
  },
]);

function App(){
  return (
    <div>
       <RouterProvider router={router} />
    </div>
  );
}

export default App;