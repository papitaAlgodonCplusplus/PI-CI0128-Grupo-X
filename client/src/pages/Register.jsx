import React from 'react'
import User from "../img/User.png"

const Register = () => {
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
        <input type="name" id="name" name="name" required />

        <label style={{ marginLeft: '35%', position: 'absolute', marginTop: '-4.75%' }}>Apellidos:</label>
        <input type="last_name" id="last_name" name="last_name" required />

        <label style={{ marginTop: '20px' }}>Correo electrónico:</label>
        <input type="email_reg" id="email_reg" name="email_reg" required />

        <label style={{ marginTop: '20px' }}>Contraseña:</label>
        <input type="password" id="password_reg" name="password_reg" className='password_reg' required />

        <label style={{ marginLeft: '35%', position: 'absolute', marginTop: '-5.28%' }}>Confimar contraseña:</label>
        <input type="password" id="password_confirm" name="password_confirm" className='password_confirm' required />
      </form>
      
      <div className="terms-box">
        <h2>Términos y Condiciones</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ut eleifend magna. Duis nec velit sit amet lectus consectetur venenatis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec vulputate, leo eget scelerisque molestie, libero lorem vestibulum ligula, ac faucibus erat nulla vel eros. Cras id dolor nec libero egestas tincidunt. Ut eu dolor eget arcu hendrerit lacinia sit amet eu quam. Phasellus nec ex aliquet, viverra risus in, fermentum libero. Ut vel nulla nisl. Duis consectetur venenatis lectus vel dictum. Curabitur id nunc quis justo congue posuere. Nunc vel lacus et turpis venenatis varius. Pellentesque nec viverra turpis.</p>
      </div>
      <button type="submit" className='create'>Crear cuenta</button>
      <button type="cancel">Cancelar</button>
    </div>
  )
}

export default Register;