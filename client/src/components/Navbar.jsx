import React from 'react'
import User from "../img/User.png"

const Navbar = () => {
  return (
      <nav>
        <div className="nav-container">
          <div className="nav-section">
            <a href="http://localhost:3000/rooms">Rooms Administration</a>
          </div>
          <div className="nav-section">
            <a href="http://localhost:3000/home">Home</a>
          </div>
          <div className="nav-section">
            <a href="http://localhost:3000/login">Log In</a>
          </div>
          <div className="nav-section">
            <a href="http://localhost:3000/register">Sign Up</a>
          </div>
          <div className="image-button">
            <a href="#user"><img src={User} alt="User Icon" /></a>
          </div>
        </div>
      </nav>
  )
}

export default Navbar;