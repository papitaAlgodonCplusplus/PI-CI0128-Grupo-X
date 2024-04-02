import React, { useState } from 'react'
import User from "../img/User.png"
import "../styles.scss"
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

const Register = () => {
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    last_name: "",
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
      await axios.post("/auth/register", inputs)
      navigate("/login")
    } catch (error) {
      if (error.response && error.response.status === 409) {
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
      <a href='http://localhost:3000/login' className='not-selected'>Loguearse</a>
      <a href='http://localhost:3000/register' className='selected-credential'>Registrarse</a>
    </div>

    <div className="upload-image">
      <img src={User} alt="User Upload" />
    </div>

    <form id="registerForm">
      <label>Nombre:</label>
      <input type="name" id="name" name="name" onChange={handleChange} required />

      <label style={{ marginLeft: '35%', position: 'absolute', marginTop: '-4.75%' }}>Apellidos:</label>
      <input type="last_name" id="last_name" name="last_name" onChange={handleChange} required />

      <label style={{ marginTop: '20px' }}>Correo electrónico:</label>
      <input type="email_reg" id="email_reg" name="email" onChange={handleChange} required />

      <label style={{ marginTop: '20px' }}>Contraseña:</label>
      <input type="password" id="password_reg" name="password" className='password_reg' onChange={handleChange} required />

      <label style={{ marginLeft: '35%', position: 'absolute', marginTop: '-5.28%' }}>Confimar contraseña:</label>
      <input type="password" id="password_confirm" name="password_confirm" className='password_confirm' required />
    </form>

    <div className="terms-box">
      <h2>Términos y Condiciones</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ut eleifend magna. Duis nec velit sit amet lectus consectetur venenatis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec vulputate, leo eget scelerisque molestie, libero lorem vestibulum ligula, ac faucibus erat nulla vel eros. Cras id dolor nec libero egestas tincidunt. Ut eu dolor eget arcu hendrerit lacinia sit amet eu quam. Phasellus nec ex aliquet, viverra risus in, fermentum libero. Ut vel nulla nisl. Duis consectetur venenatis lectus vel dictum. Curabitur id nunc quis justo congue posuere. Nunc vel lacus et turpis venenatis varius. Pellentesque nec viverra turpis.</p>
    </div>
    <button type="submit" className='create' onClick={handleSubmit}>Crear cuenta</button>
    {err && <p>{err}</p>}
    <button type="cancel">Cancelar</button>
  </div>
)
}

export default Register;