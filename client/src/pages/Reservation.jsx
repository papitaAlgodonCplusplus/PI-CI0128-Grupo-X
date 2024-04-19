/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import '../styles.scss';
import 'react-calendar/dist/Calendar.css';
import '../calendar.scss';
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Calendar from 'react-calendar';
import { Context } from '../Context.js';
import { showErrorDialog } from '../Misc.js';

const Reservation = () => {
  const [date, setDate] = useState(null);
  const { changeCheckInDate } = useContext(Context);
  const { changeCheckOutDate } = useContext(Context);
  const [reservations, setReservations] = useState([]);
  const { lastRoomClickedID } = useContext(Context);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`/reservations/get_reservations_by_room_id${lastRoomClickedID}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const navigate = useNavigate()
  const handleReserve = async e => {
    e.preventDefault()
    changeCheckInDate(date[0].toISOString().slice(0, 19).replace('T', ' '))
    changeCheckOutDate(date[1].toISOString().slice(0, 19).replace('T', ' '))
    navigate("/pay")
  }

  function dateRangeCheck(showDialog) {
    for (const reservation of reservations) {
      const checkInDate = new Date(reservation.check_in);
      const checkOutDate = new Date(reservation.check_out);

      if (date[1] >= checkInDate && date[0] <= checkOutDate) {
        document.getElementById("calendar-container-1").value = new Date();
        if (showDialog) {
          showErrorDialog("Error: ", "The chosen date range is already occupied, please select a new one.")
        }
        return false;
      }
    }

    return true;
  }

  const tileDisabled = ({ date }) => {
    for (const reservation of reservations) {
      const checkInDate = new Date(reservation.check_in);
      const checkOutDate = new Date(reservation.check_out);

      if (date >= checkInDate && date <= checkOutDate) {
        return true;
      }
    }

    const today = new Date();
    return date < today;
  };

  return (
    <div className='body'>
      {date && date.length > 0 && dateRangeCheck(true) ? (
        <div className='text-calendar'>
          <label className='text-date'>Fecha llegada: {date[0].getDate()}/{date[0].getMonth() + 1}/{date[0].getFullYear()}</label>
          <label className='text-date'>Fecha salida:  {date[1].getDate()}/{date[1].getMonth() + 1}/{date[1].getFullYear()}</label>
        </div>
      ) : (
        <div className='text-calendar'>
          <span className='text-date'>Fecha llegada: --/--/----</span>
          <span className='text-date'>Fecha salida: --/--/----</span>
        </div>
      )}
      <div className='calendar-container' id="calendar-container-1">
        <Calendar
          onChange={setDate}
          value={date}
          selectRange={true}
          tileDisabled={tileDisabled}
        />
      </div>
      <button className={`${!(date && date.length > 0 && dateRangeCheck(false)) ? 'disabled-button' : 'calendar-button'}`} onClick={handleReserve} disabled={!(date && date.length > 0 && dateRangeCheck(false))}>
        <center>Next</center>
      </button>
    </div>
  );
};

export default Reservation;