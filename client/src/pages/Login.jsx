import React from 'react'
import '../styles.scss';

const Login = () => {
  return (
    <div>
      <h2>
      Un placer verte por acá
      </h2>

      <form id="contactForm">
        <label htmlFor="email">Correo electrónico:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required/>
      </form>
    </div>
  );
};



export default Login;