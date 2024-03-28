import React from 'react'
import User from "./user.png"

const Navbar = () => {
  return (
      <nav>
        <div className="nav-container">
          <div className="nav-section">
            <a href="#register">A</a>
          </div>
          <div className="nav-section">
            <a href="#home">B</a>
          </div>
          <div className="nav-section">
            <a href="#about-us">C</a>
          </div>
          <div className="nav-section">
            <a href="#about-us">D</a>
          </div>
          <div className="image-button">
            <a href="#user"><img src={User} alt="User Icon" /></a>
          </div>
        </div>
      </nav>
  )
}

export default Navbar;