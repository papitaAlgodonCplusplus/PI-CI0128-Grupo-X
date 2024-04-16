import React, { useState, useContext } from 'react';
import '../styles.scss';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthContext.js';
import { showErrorDialog } from "../Misc.js";

const Login = () => {
  const { login } = useContext(AuthContext);

  // State to manage form inputs
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  // Hook for navigating between pages
  const navigate = useNavigate();

  // Function to handle input changes
  const handleChange = e => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Function to handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Attempt to log in using Axios
      await axios.post(`/auth/login`, inputs);

      // Retrieve user ID after successful login
      const userID = await axios.get(`/auth/getUserID${inputs.email}`);

      // Login the user using the AuthContext
      login(userID.data[0].userid);
      navigate("/home");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Show error message if user is not found
        const errorMessage = error.response.data;
        showErrorDialog("An error occurred:", errorMessage);
      } else {
        // Show any other error obtained
        showErrorDialog("An error occurred:", error);
      }
    }
  };

  // Render login form
  return (
    <div className='body'>
      <div className='credentials-container'>
        {/* Links for login and registration */}
        <a href='http://localhost:3000/login' className='selected-credential'>Loguearse</a>
        <a href='http://localhost:3000/register' className='not-selected'>Registrarse</a>
      </div>
      <h2>
        Un placer verte por acá
      </h2>

      {/* Login form */}
      <form id="loginForm">
        <label htmlFor="email">Correo electrónico:</label>
        <input type="email-login" id="email" name="email" required onChange={handleChange} />

        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required onChange={handleChange} />
        <button type="submit" onClick={handleSubmit} className='login'>Iniciar Sesión</button>
        <a href="#pass_recover" className='forgot_pass'>Olvido la contraseña?</a>
        <hr className="solid"></hr>
        <a href="http://localhost:3000/register" className='no_account'>No ha creado una cuenta aún?</a>
      </form>
    </div>
  );
};

export default Login;