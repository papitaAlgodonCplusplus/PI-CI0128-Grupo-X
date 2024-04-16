/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useCallback } from 'react'
import '../styles.scss';
import axios from "axios"
import { AuthContext } from '../AuthContext.js';
import X from "../img/X.png"
import Wrench from "../img/Wrench.png"
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';


const ReservationsList = () => {
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

  const showWarningDialog = async (title, description) => {
    return new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.classList.add('warning-modal-overlay');

      const dialog = document.createElement('div');
      dialog.classList.add('warning-modal-dialog');

      const titleElement = document.createElement('div');
      titleElement.classList.add('modal-title');
      titleElement.textContent = title;

      const descriptionElement = document.createElement('div');
      descriptionElement.classList.add('modal-description');
      descriptionElement.textContent = description;

      const closeButton = document.createElement('button');
      closeButton.classList.add('warning-modal-close');
      closeButton.textContent = 'Accept';
      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(true);
      });

      const closeButton2 = document.createElement('button');
      closeButton2.classList.add('modal-close');
      closeButton2.textContent = 'Cancel';
      closeButton2.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve(false);
      });

      dialog.appendChild(titleElement);
      dialog.appendChild(descriptionElement);
      dialog.appendChild(closeButton2);
      dialog.appendChild(closeButton);

      overlay.appendChild(dialog);

      document.body.appendChild(overlay);
    });
  };

  function calculateNumberOfDays(checkInDate, checkOutDate) {
    const checkInTime = new Date(checkInDate).getTime();
    const checkOutTime = new Date(checkOutDate).getTime();
    const differenceInMs = checkOutTime - checkInTime;
    const daysDifference = Math.ceil(differenceInMs / (1000 * 3600 * 24));
    return daysDifference;
  }

  const addReservation = (title, check_in, check_out, filename, price, id) => {
    const reservationsContainer = document.querySelector('.list-container');

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

    reservationsContainer.insertAdjacentHTML('beforeend', newReservationHTML);
    const deleteButton = document.getElementById("delete-reservation-button-" + id);
    deleteButton.addEventListener('click', (e) => handleDelete(e, id));
    const modifyButton = document.getElementById("modify-reservation-button-" + id);
    modifyButton.addEventListener('click', (e) => handleModify(e, id));
  };

  function updateReservationsContainer() {
    const reservationsContainer = document.querySelector('.list-container');
    reservationsContainer.style.gridAutoRows = 'auto';
    reservationsContainer.style.gridAutoFlow = 'dense';
  }

  const emptyReservationContainer = () => {
    const reservationsContainer = document.querySelector('.list-container');
    reservationsContainer.innerHTML = '';
    updateReservationsContainer()
  }

  const { userId } = useContext(AuthContext);
  const [fetched, setFetched] = useState(false)
  const fetchData = useCallback(async () => {
    try {
      emptyReservationContainer()
      const res = await axios.get(`/reservations/by_userID${userId}`);
      for (const reservation of res.data) {
        const checkIn = new Date(reservation.check_in).toISOString().slice(0, 19).replace('T', ' ');
        const checkOut = new Date(reservation.check_out).toISOString().slice(0, 19).replace('T', ' ');
        const res2 = await axios.get(`/rooms/by_roomID${reservation.id_room}`);
        const image = await axios.get(`/files/get_image_by_id${res2.data[0].image_id}`)
        const filepath = "/upload/" + image.data[0].filename;
        const res3 = await axios.get(`/payments/payment_byPaymentID${reservation.payment_id}`);
        addReservation(res2.data[0].title, checkIn, checkOut, filepath, res3.data[0].price, reservation.reservationid);
        updateReservationsContainer()
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

  const [roomID, setRoomID] = useState(null)
  const handleModifyConfirm = async (e) => {
    e.preventDefault()
    try {
      const res2 = await axios.get(`/rooms/by_roomID${roomID}`);
      const res3 = await axios.get(`/rooms/room_type_ByID${res2.data[0].type_of_room}`);
      let new_price = (res3.data[0].price * (calculateNumberOfDays(date[0], date[1])));
      const res4 = await axios.get(`/payments/payment_byPaymentID${reservation[0].payment_id}`);
      const res5 = await axios.get(`services/get_sum${reservation[0].reservationid}`)
      new_price = Math.floor(new_price + res5.data.totalServicePrice);
      const old_price = Math.floor(res4.data[0].price);
      if (new_price > old_price || new_price < old_price) {
        showErrorDialog("Error: ", "Cannot select a range of dates greater or lesser than the original.")
        return;
      }
      const checkOutDate = new Date(date[1]);
      checkOutDate.setDate(checkOutDate.getDate() - 1);
      const req = {
        check_in: date[0].toISOString().slice(0, 19).replace('T', ' '),
        check_out: checkOutDate.toISOString().slice(0, 19).replace('T', ' '),
        reservationID: reservation[0].reservationid,
      }
      putDataWithTimeout("/reservations/updateReservation", req)
      closeModal()
      setDate(null)
      fetchData()
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  }

  const [date, setDate] = useState(null);
  const handleModify = async (e, id) => {
    e.preventDefault()
    try {
      const response = await axios.get(`/reservations/get_reservation_by_id${id}`);
      setRoomID(response.data[0].id_room)
      axios.get(`/reservations/get_reservations_by_room_id${roomID}`)
      setReservations(response.data)
      displayModal(id)
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    try {
      const response = await axios.get(`/reservations/get_reservation_by_id${id}`);
      const checkInDate = new Date(response.data[0].check_in);
      const currentDate = new Date();
      const timeDifference = checkInDate.getTime() - currentDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      if (daysDifference <= 7) {
        const res3 = await axios.get(`/payments/payment_byPaymentID${response.data[0].payment_id}`);
        const warningResult = await showWarningDialog("Warning", "Deleting reservation within 7 days of check-in, you'll only receive " + Math.round(res3.data[0].price * 0.8) + " back.");
        if (!warningResult) {
          return;
        }
      }
      await deleteDataWithTimeout(`/reservations/delete${id}`, 500);
      fetchData();
      console.log("Deleted")
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  }

  async function deleteDataWithTimeout(url, timeout) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(null);
      }, timeout);

      axios.delete(url)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timer);
          resolve(null);
        });
    });
  }

  async function putDataWithTimeout(url, data, timeout) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(null);
      }, timeout);

      axios.put(url, data)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timer);
          resolve(null);
        });
    });
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

  const [reservations, setReservations] = useState([]);
  function dateRangeCheck(showDialog) {
    if (!date) {
      return false;
    }

    if (!date[1]) {
      return false;
    }

    for (const reservation of reservations) {
      const checkInDate = new Date(reservation.check_in);
      const checkOutDate = new Date(reservation.check_out);

      if (date[1] >= checkInDate && date[0] <= checkOutDate) {
        setDate(null);
        if (showDialog) {
          showErrorDialog("Error: ", "The chosen date range is already occupied, please select a new one.")
        }
        return false;
      }
    }

    return true;
  }

  const [reservation, setReservation] = useState(new Date());
  const tileDisabled = ({ date }) => {
    if (reservation[0]) {
      const checkInDate = new Date(reservation[0].check_in).toISOString().slice(0, 19).replace('T', ' ');
      const checkOutDate = new Date(reservation[0].check_out).toISOString().slice(0, 19).replace('T', ' ');
      if (date >= new Date(checkInDate) && date <= new Date(checkOutDate)) {
        return true;
      }
    }

    if (roomID) {
      for (const reservation of reservations) {
        const checkInDate = new Date(reservation.check_in);
        const checkOutDate = new Date(reservation.check_out);

        if (date >= checkInDate && date <= checkOutDate) {
          return true;
        }
      }
    }

    const today = new Date();
    return date < today;
  };

  return (
    <div className='body'>
      <div>
        <div className='admin-container'>
          {(
            <div id="calendar-modal" className='form-modal'>
              <div className="calendar-modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                {date && date.length > 0 && dateRangeCheck(true) ? (
                  <div className='text-modal-calendar'>
                    <label className='text-date'>Fecha llegada: {date[0].getDate()}/{date[0].getMonth() + 1}/{date[0].getFullYear()}</label>
                    <label className='text-date'>Fecha salida:  {date[1].getDate()}/{date[1].getMonth() + 1}/{date[1].getFullYear()}</label>
                  </div>
                ) : (
                  <div className='text-modal-calendar'>
                    <span className='text-date'>Fecha llegada: --/--/----</span>
                    <span className='text-date'>Fecha salida: --/--/----</span>
                  </div>
                )}
                <Calendar className="modal-calendar" id="modal-calendar-1"
                  value={date}
                  selectRange={true}
                  tileDisabled={tileDisabled}
                  onChange={setDate}
                />
                <button className={`${!(date && date.length > 0 && dateRangeCheck(false)) ? 'modal-disabled-button' : 'modal-calendar-button'}`} onClick={handleModifyConfirm} disabled={!(date && date.length > 0 && dateRangeCheck(false))}>
                  <center>Confirm</center>
                </button>
              </div>
            </div>
          )}
          <div>
            <h1 className='amenities-title'><center>Reservations</center></h1>
            <div className="list-container">
            </div>
          </div>
        </div>
      </div >
    </div>
  );
};



export default ReservationsList;