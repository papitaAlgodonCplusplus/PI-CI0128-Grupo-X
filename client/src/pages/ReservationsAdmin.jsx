/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useCallback } from 'react'
import '../styles.scss';
import axios from "axios"
import { AuthContext } from '../AuthContext.js';
import X from "../img/X.png"
import Wrench from "../img/Wrench.png"
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import Search from "../img/Search.png";
import { showErrorDialog, calculateNumberOfDays, emptyContainer, updateContainer, putDataWithTimeout, deleteDataWithTimeout } from '../Misc.js';
import { useNavigate } from 'react-router-dom';

const ReservationsAdmin = () => {
  const navigate = useNavigate()
  const { userRol } = useContext(AuthContext);
  const { userId } = useContext(AuthContext);
  const [fetched, setFetched] = useState(false)
  const [inputs, setInputs] = useState({
    name: "",
    desc: "",
    search: "",
    delete: "",
    filename: "",
  })

  // Function to add a new reservation to the reservations container
  const addReservation = (title, checkInDate, checkOutDate, imageFilename, price, reservationId) => {
    // Selecting the reservations container element
    const reservationsContainer = document.querySelector('.list-container');
    // Generating HTML for the new reservation item
    const newReservationHTML = `
  <div class="list-item" style="width: 600px; padding: 1%; margin-left: 2%;">
      <div style="display: flex; align-items: center;">
          <img src="${imageFilename}" alt="${imageFilename}" style="height: 900px; max-width: 1000px; margin-right: 2%;" />
          <div style="margin-left: 10px;">
              <h3>${title}</h3>
              <div style="display: flex; justify-content: space-between;">
                  <div style="flex: 1;">
                      <p style="max-width: 100%; display: inline-block; margin-bottom: 0%">Check In:</p>
                      <p>${checkInDate}</p>
                  </div>
                  <div style="flex: 1; margin-left: 10px;">
                      <p style="max-width: 100%; display: inline-block; margin-bottom: 0%">Check Out:</p>
                      <p>${checkOutDate}</p>
                  </div>
              </div>
              <h3 style="position: absolute; width: 50%;">Price: </h3>
              <p style="margin: 1.3%; margin-left: 25%;">${price}</p>
          </div>
      </div>
      <button class="delete-button" id="delete-reservation-button-${reservationId}" style="background-color: transparent; border: none; margin-top: -2%; position: absolute; margin-left: 41%">
          <img src=${X} alt="X" id="XImg" style="width: 40px; height: 40px; background-color: transparent; margin: 0%;" />
      </button>
      <button class="modify-button" id="modify-reservation-button-${reservationId}" style="background-color: transparent; border: none; margin-top: 6%; position: absolute; margin-left: 40.5%">
          <img src=${Wrench} alt="Wrench" id="WrenchImg" style="width: 40px; height: 40px; background-color: transparent; margin-top: 0%;" />
      </button>
  </div>  
`;
    // Adding the new reservation HTML to the reservations container
    reservationsContainer.insertAdjacentHTML('beforeend', newReservationHTML);
    // Adding event listeners for delete and modify buttons
    const deleteButton = document.getElementById("delete-reservation-button-" + reservationId);
    deleteButton.addEventListener('click', (e) => handleDelete(e, reservationId));
    const modifyButton = document.getElementById("modify-reservation-button-" + reservationId);
    modifyButton.addEventListener('click', (e) => handleModify(e, reservationId));
  };

  // Function to fetch user reservations data
  const fetchUserReservations = useCallback(async () => {
    if (userRol !== "admin" && userRol !== "employee") {
      return;
    }
    // Selecting the container element to display reservations
    const reservationsContainer = document.querySelector('.list-container');
    try {
      // Clearing the reservations container
      emptyContainer(reservationsContainer);
      // Fetching reservations data for the current user
      const userReservationsResponse = await axios.get(`/reservations/by_userID${userId}`);
      // Iterating over each reservation
      for (const reservation of userReservationsResponse.data) {
        // Converting check-in and check-out dates to a readable format
        const checkInDate = new Date(reservation.check_in).toISOString().slice(0, 19).replace('T', ' ');
        const checkOutDate = new Date(reservation.check_out).toISOString().slice(0, 19).replace('T', ' ');
        // Fetching room details for the reservation
        const roomResponse = await axios.get(`/rooms/by_roomID${reservation.id_room}`);
        // Fetching image details for the room
        const imageResponse = await axios.get(`/files/get_image_by_id${roomResponse.data[0].image_id}`);
        const imagePath = "/upload/" + imageResponse.data[0].filename;
        // Fetching payment details for the reservation
        const paymentResponse = await axios.get(`/payments/payment_byPaymentID${reservation.payment_id}`);
        // Adding reservation to the UI
        addReservation(roomResponse.data[0].title, checkInDate, checkOutDate, imagePath,
          paymentResponse.data[0].price, reservation.reservationid);
        // Updating the reservations container
        updateContainer(reservationsContainer);
      }
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  });

  useEffect(() => {
    if (!fetched) {
      fetchUserReservations();
      setFetched(true);
    }
  }, [fetchUserReservations, fetched]);

  // State variable for room ID
  const [selectedRoomID, setSelectedRoomID] = useState(null);

  // Function to handle confirmation of reservation modification
  const handleModifyConfirm = async (e) => {
    e.preventDefault(); // Preventing default form submission behavior
    try {
      // Fetching room details based on the selected room ID
      const roomResponse = await axios.get(`/rooms/by_roomID${selectedRoomID}`);
      // Fetching room type details for the selected room
      const roomTypeResponse = await axios.get(`/rooms/room_type_ByID${roomResponse.data[0].type_of_room}`);
      // Calculating new price based on the room type and selected dates
      let newPrice = roomTypeResponse.data[0].price * calculateNumberOfDays(selectedDateRange[0],
        selectedDateRange[1]);
      // Fetching payment details for the reservation
      const paymentResponse = await axios.get(`/payments/payment_byPaymentID${reservation[0].payment_id}`);
      // Fetching total service price for the reservation
      const servicePriceResponse = await axios.get(`services/get_sum${reservation[0].reservationid}`);
      // Adding total service price to the new price
      newPrice += servicePriceResponse.data.totalServicePrice;
      // Rounding the new price
      newPrice = Math.floor(newPrice);
      // Getting the original price from payment details
      const originalPrice = Math.floor(paymentResponse.data[0].price);
      // Comparing the new price with the original price
      console.log(newPrice, originalPrice)
      if (Math.abs(originalPrice - newPrice) > 1 ) {
        showErrorDialog("Error: ", "Cannot select a range of dates greater or lesser than the original.");
        return;
      }
      // Creating request object for updating the reservation
      const request = {
        check_in: selectedDateRange[0].toISOString().slice(0, 19).replace('T', ' '),
        check_out: selectedDateRange[1].toISOString().slice(0, 19).replace('T', ' '),
        reservationID: reservation[0].reservationid,
      };
      // Making a PUT request to update the reservation
      putDataWithTimeout("/reservations/updateReservation", request);
      // Closing the modal
      closeModal();
      // Resetting date state
      setSelectedDateRange(null);
      // Fetching user reservations to update UI
      fetchUserReservations();
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  };

  // State variable for selected date range
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Function to handle modification of reservation
  const handleModify = async (e, reservationId) => {
    e.preventDefault(); // Preventing default form submission behavior
    try {
      // Fetching reservation details by ID
      const reservationResponse = await axios.get(`/reservations/get_reservation_by_id${reservationId}`);
      // Extracting room ID from reservation response
      const roomID = reservationResponse.data[0].id_room;
      // Setting the selected room ID state
      setSelectedRoomID(roomID);
      // Fetching reservations for the selected room ID
      axios.get(`/reservations/get_reservations_by_room_id${roomID}`);
      // Setting reservations state with reservation data
      setReservations(reservationResponse.data);
      // Displaying modal for reservation modification
      displayModal(reservationId);
      return;
    } catch (error) {
      // Displaying error dialog if an error occurs
      showErrorDialog("An error occurred:", error);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault()
    try {
      await deleteDataWithTimeout(`/reservations/delete${id}`, 500);
      fetchUserReservations();
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  }

  const displayModal = async (id) => {
    const response = await axios.get(`/reservations/get_reservation_by_id${id}`);
    setReservation(response.data)
    var modal = document.getElementById("calendar-modal");
    modal.style.display = "block";
  }

  function closeModal() {
    var modal = document.getElementById("calendar-modal");
    modal.style.display = "none";
  }

  const handleChange = e => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const [reservations, setReservations] = useState([]);
  function dateRangeCheck(showDialog) {
    if (!selectedDateRange) {
      return false;
    }
    if (!selectedDateRange[1]) {
      return false;
    }
    for (const reservation of reservations) {
      const checkInDate = new Date(reservation.check_in);
      const checkOutDate = new Date(reservation.check_out);
      if (selectedDateRange[1] >= checkInDate && selectedDateRange[0] <= checkOutDate) {
        setSelectedDateRange(null);
        if (showDialog) {
          showErrorDialog("Error: ", "The chosen date range is already occupied, please select a new one.")
        }
        return false;
      }
    }
    return true;
  }
  
  const [reservation, setReservation] = useState(new Date());

  // Function to determine if a date should be disabled on the calendar tile
  const tileDisabled = ({ date }) => {
    // Checking if there is a reservation
    if (reservation[0]) {
      // Extracting check-in and check-out dates from the reservation
      const checkInDate = new Date(reservation[0].check_in).toISOString().slice(0, 19).replace('T', ' ');
      const checkOutDate = new Date(reservation[0].check_out).toISOString().slice(0, 19).replace('T', ' ');
      // Checking if the date falls within the reservation period
      if (date >= new Date(checkInDate) && date <= new Date(checkOutDate)) {
        return true; // Disabling the tile if the date is within the reservation period
      }
    }
    // Checking if a room is selected and there are reservations
    if (selectedRoomID && reservations.length > 0) {
      // Iterating over each reservation to check if the date falls within any reservation period
      for (const reservationItem of reservations) {
        const checkInDate = new Date(reservationItem.check_in);
        const checkOutDate = new Date(reservationItem.check_out);
        // Checking if the date falls within the reservation period
        if (date >= checkInDate && date <= checkOutDate) {
          return true; // Disabling the tile if the date is within any reservation period
        }
      }
    }
    const today = new Date();
    // Disabling the tile if the date is before today
    return date < today;
  };
  // Function to handle search for reservations by user email
  const handleSearch = async (e) => {
    // Selecting the reservations container element
    const reservationsContainer = document.querySelector('.list-container');
    e.preventDefault();
    // Getting the email input value
    const email = inputs.search;
    // If the email input is empty, return
    if (email === '') {
      return;
    } else {
      try {
        // Clearing the reservations container
        emptyContainer(reservationsContainer);
        // Fetching user ID based on the provided email
        const userResponse = await axios.get(`/auth/getUserID${email}`);
        // If no user is found, show error dialog and return
        if (!userResponse.data[0]) {
          showErrorDialog("An error occurred:", "Invalid email");
          return;
        }
        // Fetching reservations for the user ID
        const reservationsResponse = await axios.get(`/reservations/by_userID${userResponse.data[0].userid}`);
        // Iterating over each reservation
        for (const reservation of reservationsResponse.data) {
          // Converting check-in and check-out dates to a readable format
          const checkInDate = new Date(reservation.check_in).toISOString().slice(0, 19).replace('T', ' ');
          const checkOutDate = new Date(reservation.check_out).toISOString().slice(0, 19).replace('T', ' ');
          // Fetching room details for the reservation
          const roomResponse = await axios.get(`/rooms/by_roomID${reservation.id_room}`);
          // Fetching image details for the room
          const imageResponse = await axios.get(`/files/get_image_by_id${roomResponse.data[0].image_id}`);
          const imagePath = "/upload/" + imageResponse.data[0].filename;
          // Fetching payment details for the reservation
          const paymentResponse = await axios.get(`/payments/payment_byPaymentID${reservation.payment_id}`);
          // Adding reservation to the UI
          addReservation(roomResponse.data[0].title, checkInDate, checkOutDate, imagePath, paymentResponse.data[0].price, reservation.reservationid);
          // Updating the reservations container
          updateContainer(reservationsContainer);
        }
        return;
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }
    }
  };

  return ( userRol === "admin" || userRol === "employee" ?
    <div className='body'>
      <div>
        <div className='admin-container'>
          {(
            // Calendar modal
            <div id="calendar-modal" className='form-modal'>
              <div className="calendar-modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                {/* Displaying selected date range if available */}
                {selectedDateRange && selectedDateRange.length > 0 && dateRangeCheck(true) ? (
                  <div className='text-modal-calendar'>
                    <label className='text-date'>Fecha llegada: {selectedDateRange[0].getDate()}/{selectedDateRange[0].getMonth() + 1}/{selectedDateRange[0].getFullYear()}</label>
                    <label className='text-date'>Fecha salida:  {selectedDateRange[1].getDate()}/{selectedDateRange[1].getMonth() + 1}/{selectedDateRange[1].getFullYear()}</label>
                  </div>
                ) : (
                  // Displaying default date range if no selection
                  <div className='text-modal-calendar'>
                    <span className='text-date'>Fecha llegada: --/--/----</span>
                    <span className='text-date'>Fecha salida: --/--/----</span>
                  </div>
                )}
                {/* Calendar component */}
                <Calendar className="modal-calendar" id="modal-calendar-1"
                  value={selectedDateRange}
                  selectRange={true}
                  tileDisabled={tileDisabled}
                  onChange={setSelectedDateRange}
                />
                {/* Button to confirm modification */}
                <button className={`${!(selectedDateRange && selectedDateRange.length > 0 &&
                  dateRangeCheck(false)) ? 'modal-disabled-button' : 'modal-calendar-button'}`}
                  onClick={handleModifyConfirm} disabled={!(selectedDateRange && selectedDateRange.length > 0
                    && dateRangeCheck(false))}>
                  <center>Confirm</center>
                </button>
              </div>
            </div>
          )}
          {/* Search container */}
          <div>
            <div className="search-container-admin">
              <input type="text" name="search" id="search" onChange={handleChange}
                placeholder="Enter your search query" />
              {/* Button to trigger search */}
              <button className="searchImg">
                <img src={Search} alt="Search" id="searchImg" onClick={handleSearch} />
              </button>
            </div>
            {/* Reservations title */}
            <h1 className='amenities-title'><center>Reservations</center></h1>
            {/* Container for displaying reservations */}
            <div className="list-container">
            </div>
          </div>
        </div>
      </div>
    </div>
  : <div>{showErrorDialog("Error: ", "You must login as admin or employee to access this page", true, navigate)}</div>);
};

export default ReservationsAdmin;