/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react';
import '../styles.scss';
import axios from "axios";
import X from "../img/X.png";
import Plus from "../img/Add.png";
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { emptyContainer, updateContainer, showErrorDialog, postDataWithTimeout, deleteDataWithTimeout } from '../Misc';

const Amenities = () => {
  const navigate = useNavigate()
  const { userRol } = useContext(AuthContext);
  // State for input fields
  const [inputs, setInputs] = useState({
    service_name: "", // Name of the amenity
    fee: "",         // Fee for the amenity
  });

  // Function to add a new service to the UI
  const addService = (title, fee, id) => {
    const newServiceHTML = `
    <div class="list-item">
    <div>
      <h3>${title}</h3>
      <p>${fee}</p>
    </div>
      <button class="delete-button" id="delete-room-button-${title}">
        <img src=${X} alt="X" id="XImg" style="width:40px; height:40px; background-color: transparent;"/>
      </button>
    </div>
  `;

    const services_table = document.querySelector('.list-container');
    services_table.insertAdjacentHTML('beforeend', newServiceHTML);
    const deleteButton = document.getElementById("delete-room-button-" + title);
    deleteButton.addEventListener('click', (e) => handleDelete(e, id));
  };

  // Function to fetch services data from server
  const fetchData = async () => {
    if (userRol !== "admin" && userRol !== "employee") {
      return;
    }
    const services_table = document.querySelector('.list-container');
    try {
      const res = await axios.get("/services");
      emptyContainer(services_table);
      // Add each service to the UI
      res.data.forEach(service => {
        addService(service.service_name, service.service_price, service.serviceid);
      });
      updateContainer(services_table);
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to handle deletion of a service
  const handleDelete = async (e, id) => {
    try {
      e.preventDefault();
      await deleteDataWithTimeout(`/services/delete/${id}`, 500);
      fetchData()
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  }

  // Function to handle form submission
  const handleSubmit = async e => {
    e.preventDefault()
    // Validate input fields
    if (!inputs.service_name) {
      showErrorDialog("An error occurred:", "Please add a title");
      return;
    }
    if (!inputs.fee) {
      showErrorDialog("An error occurred:", "Please add a fee");
      return;
    }
    try {
      // Post data to server
      await postDataWithTimeout("/services/add_service", inputs, 200);
      fetchData();
      closeModal();
      window.location.reload();
      return;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data;
        showErrorDialog("An error occurred:", errorMessage);
      } else {
        showErrorDialog("An error occurred:", error);
      }
    }
  }

  // Function to display modal
  function displayModal() {
    var modal = document.getElementById("myFormModal");
    modal.style.display = "block";
  }

  // Function to close modal
  function closeModal() {
    var modal = document.getElementById("myFormModal");
    modal.style.display = "none";
  }

  // Function to handle input change
  const handleChange = e => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (userRol === "admin" || userRol === "employee" ?
    <div className='body'>
      <div id="myFormModal" className="form-modal">
        <div className="form-modal-content">
          <span className="close" onClick={closeModal}>&times;</span>
          <form id="myForm">
            <label htmlFor="service_name">Name of the Amenity</label><br />
            <input type="text" id="service_name" name="service_name" onChange={handleChange} /><br />
            <label htmlFor="fee">Fee of the Amenity</label><br />
            <input type="number" id="fee" className="fee-input" name="fee" onChange={handleChange} /><br />
            <button className="Plus">
              <img src={Plus} alt="Plus" id="plusImg" onClick={handleSubmit} />
            </button>
          </form>
        </div>
      </div>
      <div className='admin-container'>
        <div>
          <h1 className='amenities-title'><center>Servicios de Habitacion</center></h1>
          <div className="list-container">
          </div>
          <button className="add-room-button" onClick={displayModal}><center>Add Amenity</center></button>
        </div>
        <div>
          <h1 className='reservations-title'><center>Detalles de Fechas</center></h1>
        </div>
      </div>
    </div >
    : <div>{showErrorDialog("Error: ", "You must login as admin or employee to access this page", true, navigate)}</div>);
};

export default Amenities;