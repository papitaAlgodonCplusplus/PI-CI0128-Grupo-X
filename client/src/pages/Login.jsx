import React from 'react'
import '../styles.scss';

const Login = () => {
  return (
    <div>
      <h2>
        <center>Contactar</center>
      </h2>

      <form id="contactForm">
        <label htmlFor="name">Nombre:</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="message">Mensaje:</label>
        <textarea id="message" name="message" required></textarea>

        <label htmlFor="contactType">Información de contacto:</label>
        <select id="contactType" name="contactType">
          <option value="phoneNumber" selected>Teléfono Celular</option>
          <option value="replyEmail">Email</option>
        </select>
      </form>
    </div>
  );
};



export default Login;