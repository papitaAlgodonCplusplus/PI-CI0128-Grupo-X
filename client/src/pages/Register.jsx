import React, { useState } from 'react'
import User from "../img/User.png"
import "../styles.scss"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { showErrorDialog } from '../Misc'

const Register = () => {
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    last_name: "",
    password_confirm: "",
    rol: "client",
  })

  const [err] = useState(null)
  const navigate = useNavigate()

  const handleChange = e => {
    console.log(inputs)
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.email)) {
      showErrorDialog("An error occurred:", "Please enter a valid email address.");
      return;
    }

    const password = inputs.password;
    const passwordRegEx = /^^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (inputs.password !== inputs.password_confirm){
      showErrorDialog("An error occurred:", "Passwords don't match");
      return;
    }
    
    if (passwordRegEx.test(password)) {
      e.preventDefault()
      try {
        await axios.post("/auth/register", inputs)
        navigate("/")
      } catch (error) {
        if (error.response && error.response.status === 409) {
          const errorMessage = error.response.data;
          showErrorDialog("An error occurred:", errorMessage);
        } else {
          showErrorDialog("An error occurred:", error);
        }
      }
    } else {
      showErrorDialog("An error occurred:", "Password must be minimum eight characters, have at least one letter and one number");
      return;
    }
  }

  const handleCancel = e => {
    navigate("/")
    return;
  }

  return (
    <div className='register-window'>
      <div className='credentials-container'>
        <a href='http://localhost:3000/' className='not-selected'>Loguearse</a>
        <a href='http://localhost:3000/register' className='selected-credential'>Registrarse</a>
      </div>

      <div className="upload-image">
        <img src={User} alt="User Upload" />
      </div>

      <form id="registerForm" style={{  overflowX: "hidden"}}>
        <label>Nombre:</label>
        <input type="name" id="name" name="name" onChange={handleChange} required />

        <label style={{ marginLeft: '35%', position: 'absolute', marginTop: '-4.75%' }}>Apellidos:</label>
        <input type="last_name" id="last_name" name="last_name" onChange={handleChange} required />

        <label style={{ marginTop: '20px' }}>Correo electrónico:</label>
        <input type="email" id="email_reg" name="email" onChange={handleChange} required />

        <label style={{ marginTop: '20px' }}>Contraseña:</label>
        <input type="password" id="password_reg" name="password" className='password_reg' onChange={handleChange} required />

        <label style={{ marginLeft: '35%', position: 'absolute', marginTop: '-5.28%' }}>Confimar contraseña:</label>
        <input type="password" id="password_confirm" name="password_confirm" className='password_confirm' onChange={handleChange} required />
      </form>

      <div className="terms-box">
        <h2>Términos y Condiciones</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ut eleifend magna. Duis nec velit sit amet lectus consectetur venenatis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec vulputate, leo eget scelerisque molestie, libero lorem vestibulum ligula, ac faucibus erat nulla vel eros. Cras id dolor nec libero egestas tincidunt. Ut eu dolor eget arcu hendrerit lacinia sit amet eu quam. Phasellus nec ex aliquet, viverra risus in, fermentum libero. Ut vel nulla nisl. Duis consectetur venenatis lectus vel dictum. Curabitur id nunc quis justo congue posuere. Nunc vel lacus et turpis venenatis varius. Pellentesque nec viverra turpis.</p>
      </div>
      <button type="submit" className='create' onClick={handleSubmit}>Crear cuenta</button>
      {err && <p>{err}</p>}
      <button type="cancel" onClick={handleCancel}>Cancelar</button>
    </div>
  )
}

export default Register;