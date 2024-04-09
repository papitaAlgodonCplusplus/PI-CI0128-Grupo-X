import React, { useState } from 'react'
import '../styles.scss';
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"

function showErrorDialog(title, description) {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');

  const dialog = document.createElement('div');
  dialog.classList.add('modal-dialog');

  const titleElement = document.createElement('div');
  titleElement.classList.add('modal-title');
  titleElement.textContent = title;

  const descriptionElement = document.createElement('div');
  descriptionElement.classList.add('modal-description');
  descriptionElement.textContent = description;
  console.log(description)

  const closeButton = document.createElement('button');
  closeButton.classList.add('modal-close');
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  dialog.appendChild(titleElement);
  dialog.appendChild(descriptionElement);
  dialog.appendChild(closeButton);

  overlay.appendChild(dialog);

  document.body.appendChild(overlay);
}

const Login = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  })

  const [err, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = e => {
    console.log(inputs)
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.post("/auth/login", inputs)
      navigate("/home")
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data;
        showErrorDialog("An error occurred:", errorMessage);
      } else {
        console.error("An error occurred:", error);
      }
    }
  }

  return (
    <div>
      <div className='credentials-container'>
        <a href='http://localhost:3000/login' className='selected-credential'>Loguearse</a>
        <a href='http://localhost:3000/register' className='not-selected'>Registrarse</a>
      </div>
      <h2>
        Un placer verte por acá
      </h2>

      <form id="loginForm">
        <label htmlFor="email">Correo electrónico:</label>
        <input type="email" id="email" name="email" required onChange={handleChange} />

        <label htmlFor="password">Contraseña:</label>
        <input type="password" id="password" name="password" required onChange={handleChange} />
        <button type="submit" onClick={handleSubmit} className='login'>Iniciar Sesión</button>
        {err && <p>{err}</p>}
        <a href="#pass_recover" className='forgot_pass'>Olvido la contraseña?</a>
        <hr className="solid"></hr>
        <a href="http://localhost:3000/register" className='no_account'>No ha creado una cuenta aún?</a>
      </form>
    </div>
  );
};



export default Login;