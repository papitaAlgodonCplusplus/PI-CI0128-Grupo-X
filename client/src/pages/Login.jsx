import React from 'react'
import '../styles.scss';

const Login = () => {
  return (
    <div>
      <div className='credentials-container'>
        <a href='#login'>Loguearse</a>
        <a href='#register'>Registrarse</a>
      </div>
      <h2>
        Un placer verte por acá
      </h2>

      <form id="contactForm">
        <label htmlFor="email">Correo electrónico:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required />
        <button type="submit">Iniciar Sesión</button>
        <a href="#pass_recover" className='forgot_pass'>Olvido la contraseña?</a>
        <hr class="solid"></hr>
        <a href="#register" className='no_account'>No ha creado una cuenta aún?</a>
      </form>
    </div>
  );
};



export default Login;