import React, { useState, useEffect, useContext } from 'react'
import '../styles.scss';
import 'react-calendar/dist/Calendar.css';
import '../calendar.scss';
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Calendar from 'react-calendar';
import { Context } from '../Context.js';

const Reservation = () => {
  const [date, setDate] = useState(null);
  const { changeCheckInDate } = useContext(Context);
  const { changeCheckOutDate } = useContext(Context);
  const [reservations, setReservations] = useState([]);
  const { lastRoomClickedID } = useContext(Context);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`/reservations/get_reservations_by_room_id${lastRoomClickedID}`);
        setReservations(response.data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchReservations();
  }, [lastRoomClickedID]);

  const navigate = useNavigate()
  const handleReserve = async e => {
    e.preventDefault()
    changeCheckInDate(date[0])
    changeCheckOutDate(date[1])
    navigate("/pay")
  }

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
    return;
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
