/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useCallback } from 'react'
import '../styles.scss';
import axios from "axios"
import { AuthContext } from '../AuthContext.js';
import X from "../img/X.png"
import Wrench from "../img/Wrench.png"
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { showErrorDialog, showWarningDialog, calculateNumberOfDays, emptyContainer, updateContainer, deleteDataWithTimeout, putDataWithTimeout } from '../Misc.js';

const ReservationsList = () => {
  // Function to add a reservation to the UI
  const addReservation = (title, check_in, check_out, filename, price, id) => {
    // Selecting the reservations container
    const reservationsContainer = document.querySelector('.list-container');

    // Generating HTML for the new reservation
    const newReservationHTML = `
    <div class="list-item" style="width: 600px; padding: 1%; margin-left: 2%;">
      <div style="display: flex; align-items: center;">
        <img src="${filename}" alt="${filename}" style="height: 900px; max-width: 1000px; margin-right: 2%;" />
        <div style="margin-left: 10px;">
          <h3>${title}</h3>
          <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1;">
              <p style="max-width: 100%; display: inline-block; margin-bottom: 0%">Check In:</p>
              <p>${check_in}</p>
            </div>
            <div style="flex: 1; margin-left: 10px;">
              <p style="max-width: 100%; display: inline-block; margin-bottom: 0%">Check Out:</p>
              <p>${check_out}</p>
            </div>
          </div>
          <h3 style="position: absolute; width: 50%;">Price: </h3>
          <p style="margin: 1.3%; margin-left: 25%;">${price}</p>
        </div>
      </div>
      <button class="delete-button" id="delete-reservation-button-${id}" style="background-color: transparent; border: none; margin-top: -2%; position: absolute; margin-left: 41%">
        <img src=${X} alt="X" id="XImg" style="width: 40px; height: 40px; background-color: transparent; margin: 0%;" />
      </button>
      <button class="modify-button" id="modify-reservation-button-${id}" style="background-color: transparent; border: none; margin-top: 6%; position: absolute; margin-left: 40.5%">
        <img src=${Wrench} alt="Wrench" id="WrenchImg" style="width: 40px; height: 40px; background-color: transparent; margin-top: 0%;" />
      </button>
    </div>  
  `;

    // Inserting the new reservation HTML into the container
    reservationsContainer.insertAdjacentHTML('beforeend', newReservationHTML);

    // Adding event listener for delete button
    const deleteButton = document.getElementById("delete-reservation-button-" + id);
    deleteButton.addEventListener('click', (e) => handleDelete(e, id));

    // Adding event listener for modify button
    const modifyButton = document.getElementById("modify-reservation-button-" + id);
    modifyButton.addEventListener('click', (e) => handleModify(e, id));
  };

  const { userId } = useContext(AuthContext);
  const [fetched, setFetched] = useState(false);
  const [reservations, setReservations] = useState([]);
  const fetchData = useCallback(async () => {
    // Selecting the services container
    const servicesContainer = document.querySelector('.list-container');

    try {
      // Clearing the services container
      emptyContainer(servicesContainer);

      // Fetching reservations data for the current user
      const res = await axios.get(`/reservations/by_userID${userId}`);

      // Iterating through each reservation
      for (const reservation of res.data) {
        // Formatting check-in and check-out dates
        const checkIn = new Date(reservation.check_in).toISOString().slice(0, 19).replace('T', ' ');
        const checkOut = new Date(reservation.check_out).toISOString().slice(0, 19).replace('T', ' ');

        // Fetching room data for the reservation
        const res2 = await axios.get(`/rooms/by_roomID${reservation.id_room}`);

        // Fetching image data for the room
        const image = await axios.get(`/files/get_image_by_id${res2.data[0].image_id}`);
        const filepath = "/upload/" + image.data[0].filename;

        // Fetching payment data for the reservation
        const res3 = await axios.get(`/payments/payment_byPaymentID${reservation.payment_id}`);

        // Adding reservation to the services container
        addReservation(res2.data[0].title, checkIn, checkOut, filepath, res3.data[0].price, reservation.reservationid);

        // Updating the services container
        updateContainer(servicesContainer);
      }
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  });

  useEffect(() => {
    if (!fetched) {
      fetchData();
      setFetched(true);
    }
  }, [fetchData, fetched]);

  // State variable for room ID
  const handleModifyConfirm = async (e) => {
    // Preventing the default form submission behavior
    e.preventDefault();

    try {
      // Fetching room data based on room ID
      const res2 = await axios.get(`/rooms/by_roomID${selectedRoomID}`);

      // Fetching room type data based on room type ID
      const res3 = await axios.get(`/rooms/room_type_ByID${res2.data[0].type_of_room}`);

      // Calculating new price based on selected dates and room type price
      let new_price = (res3.data[0].price * (calculateNumberOfDays(selectedDateRange[0], selectedDateRange[1])));

      // Fetching payment data based on payment ID
      const res4 = await axios.get(`/payments/payment_byPaymentID${reservation[0].payment_id}`);

      // Fetching total service price for the reservation
      const res5 = await axios.get(`services/get_sum${reservation[0].reservationid}`);

      // Adding total service price to the new price
      new_price = Math.floor(new_price + res5.data.totalServicePrice);

      // Getting the old price from payment data
      const old_price = Math.floor(res4.data[0].price);

      // Checking if the new price is greater or lesser than the original
      if (Math.abs(old_price - new_price) > 1) {
        // Showing error message if the new price is not valid
        showErrorDialog("Error: ", "Cannot select a range of dates greater or lesser than the original.");
        return;
      }
      
      // Creating request object with updated reservation data
      const req = {
        check_in: selectedDateRange[0].toISOString().slice(0, 19).replace('T', ' '),
        check_out: selectedDateRange[1].toISOString().slice(0, 19).replace('T', ' '),
        reservationID: reservation[0].reservationid,
      };

      // Updating reservation data on the server
      putDataWithTimeout("/reservations/updateReservation", req);

      // Closing modal
      closeModal();

      // Resetting date state
      setSelectedDateRange(null);

      // Fetching updated reservation data
      fetchData();

      return;
    } catch (error) {
      // Handling errors
      showErrorDialog("An error occurred:", error);
    }
  };

  // State variable for selected date range
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [selectedRoomID, setSelectedRoomID] = useState(null);

  // Function to handle modification of reservation
  const handleModify = async (e, reservationId) => {
    e.preventDefault(); // Preventing default form submission behavior
    try {
      // Fetching reservation details by ID
      const reservationResponse = await axios.get(`/reservations/get_reservation_by_id${reservationId}`);

      // Extract room ID from the response data and set it
      const roomId = reservationResponse.data[0].id_room;
      setSelectedRoomID(roomId)

      // Fetch reservations for the specific room
      const roomReservationsResponse = await axios.get(`/reservations/get_reservations_by_room_id${roomId}`);

      // Set reservations state with the fetched data
      setReservations(roomReservationsResponse.data);
      // Display modal for modification
      displayModal(reservationId);
      return;
    } catch (error) {
      // Displaying error dialog if an error occurs
      showErrorDialog("An error occurred:", error);
    }
  };

  // Function to handle deletion of reservation
  const handleDelete = async (e, reservationId) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Fetch reservation data by ID
      const reservationResponse = await axios.get(`/reservations/get_reservation_by_id${reservationId}`);

      // Extract check-in date from response
      const checkInDate = new Date(reservationResponse.data[0].check_in);

      // Get current date
      const currentDate = new Date();

      // Calculate time difference between check-in date and current date
      const timeDifference = checkInDate.getTime() - currentDate.getTime();

      // Calculate days difference
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

      // If check-in is within 7 days, show warning
      if (daysDifference <= 7) {
        // Fetch payment data by payment ID
        const paymentResponse = await axios.get(`/payments/payment_byPaymentID${reservationResponse.data[0].payment_id}`);

        // Calculate refund amount
        const refundAmount = Math.round(paymentResponse.data[0].price * 0.8);

        // Show warning dialog
        const warningResult = await showWarningDialog("Warning", `Deleting reservation within 7 days of check-in, you'll only receive ${refundAmount} back.`);

        // If user cancels deletion, return
        if (!warningResult) {
          return;
        }
      }

      // Delete reservation data with timeout
      await deleteDataWithTimeout(`/reservations/delete${reservationId}`, 500);

      // Fetch updated data
      fetchData();

      // Log deletion success
      console.log("Deleted");
      return;
    } catch (error) {
      // Show error dialog if an error occurs
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

  // Function to check if the selected date range is available
  function dateRangeCheck(showDialog) {
    // Check if selectedDateRange exists
    if (!selectedDateRange) {
      return false;
    }

    // Check if the end date of the range is selected
    if (!selectedDateRange[1]) {
      return false;
    }

    // Iterate through each reservation to check for overlap
    for (const reservation of reservations) {
      // Convert reservation check-in and check-out dates to Date objects
      const checkInDate = new Date(reservation.check_in);
      const checkOutDate = new Date(reservation.check_out);

      // Check if the selected date range overlaps with any reservation
      if (selectedDateRange[1] >= checkInDate && selectedDateRange[0] <= checkOutDate) {
        // If overlap found, reset selectedDateRange and show error dialog if showDialog is true
        setSelectedDateRange(null);
        if (showDialog) {
          showErrorDialog("Error: ", "The chosen date range is already occupied, please select a new one.");
        }
        return false;
      }
    }

    // If no overlap found, return true
    return true;
  }


  const [reservation, setReservation] = useState(new Date());
  // Function to determine if a date should be disabled in the calendar tile
  const tileDisabled = ({ date }) => {
    // Check if there is a single reservation
    if (reservation[0]) {
      // Extract check-in and check-out dates from the reservation
      const checkInDate = new Date(reservation[0].check_in).toISOString().slice(0, 19).replace('T', ' ');
      const checkOutDate = new Date(reservation[0].check_out).toISOString().slice(0, 19).replace('T', ' ');

      // Check if the date falls within the reservation period
      if (date >= new Date(checkInDate) && date <= new Date(checkOutDate)) {
        return true;
      }
    }

    // Check if there are multiple reservations
    if (reservations) {
      // Iterate through each reservation
      for (const reservation of reservations) {
        // Extract check-in and check-out dates from the reservation
        const checkInDate = new Date(reservation.check_in);
        const checkOutDate = new Date(reservation.check_out);

        // Check if the date falls within any reservation period
        if (date >= checkInDate && date <= checkOutDate) {
          return true;
        }
      }
    }

    // If the date is in the past, disable it
    const today = new Date();
    return date < today;
  }

  // Return statement rendering the component
  return (
    <div className='body'>
      <div>
        <div className='admin-container'>
          {/* Calendar Modal */}
          {(
            <div id="calendar-modal" className='form-modal'>
              <div className="calendar-modal-content">
                {/* Close button */}
                <span className="close" onClick={closeModal}>&times;</span>
                {/* Selected date range display */}
                {selectedDateRange && selectedDateRange.length > 0 && dateRangeCheck(true) ? (
                  <div className='text-modal-calendar'>
                    {/* Display selected check-in date */}
                    <label className='text-date'>Fecha llegada: {selectedDateRange[0].getDate()}/{selectedDateRange[0].getMonth() + 1}/{selectedDateRange[0].getFullYear()}</label>
                    {/* Display selected check-out date */}
                    <label className='text-date'>Fecha salida:  {selectedDateRange[1].getDate()}/{selectedDateRange[1].getMonth() + 1}/{selectedDateRange[1].getFullYear()}</label>
                  </div>
                ) : (
                  <div className='text-modal-calendar'>
                    {/* Display placeholder for check-in date */}
                    <span className='text-date'>Fecha llegada: --/--/----</span>
                    {/* Display placeholder for check-out date */}
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
                {/* Confirm button */}
                <button className={`${!(selectedDateRange && selectedDateRange.length > 0 && dateRangeCheck(false)) ? 'modal-disabled-button' : 'modal-calendar-button'}`} onClick={handleModifyConfirm} disabled={!(selectedDateRange && selectedDateRange.length > 0 && dateRangeCheck(false))}>
                  <center>Confirm</center>
                </button>
              </div>
            </div>
          )}
          {/* Reservation List */}
          <div>
            <h1 className='amenities-title'><center>Reservations</center></h1>
            <div className="list-container">
              {/* Reservation items will be rendered here */}
            </div>
          </div>
        </div>
      </div >
    </div>
  );
};

export default ReservationsList;