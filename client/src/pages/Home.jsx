/* eslint-disable no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useCallback } from 'react';
import '../styles.scss';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StarIcon from "../img/Star.png";
import SearchIcon from "../img/Search.png";
import CouponIcon from "../img/Coupon.png";
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { Context } from '../Context.js';
import { AuthContext } from '../AuthContext.js';
import { emptyContainer, updateContainer, showErrorDialog } from "../Misc.js";

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext);
  let cardsContainer = null;
  const [modalVisible, setModalVisible] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    desc: "",
    searchQuery: "",
    delete: "",
    filename: "",
  });
  const { changeLastRoomClickedID } = useContext(Context);
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState(null);

  const addCardToUI = useCallback((title, description, imageSrc, roomId) => {
    // Construct HTML for a new card dynamically
    const newCardHTML = `
      <div style="
        height: 220px;
        background-color: #f0f0f0;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5);
        display: grid;
        grid-template-columns: 60% 40%;
        padding-top: 1.5%;
        gap: 10px;
        text-align: justify;
        overflow: hidden;" className="card" data-title="${title}">
        <div><img src="${imageSrc}" alt="View of the room" style="width: 360px;
        height: 220px;
        border-radius: 8px;"></img></div>
        <div>
          <h2 style="
          margin: 0;
          position: static; 
          word-wrap: break-word;"><center>${title}</center></h2>
          <p style="
          margin: 3%;
          position: static;
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 7;
          -webkit-box-orient: vertical;
          word-wrap: break-word;">${description}</p>
          <div className="icon-container" style="
          margin-top: 4%;
          display: flex;">
            <div className="icon-container-left-column" style="
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4%;
            flex: 60%;">
              <img src=${StarIcon} alt="Star 1" style="
              border-radius: 8px;
              margin: 0;
              padding: 0;
              max-width: 20%;
              height: auto;"/>
              <img src=${StarIcon} alt="Star 2" style="
              border-radius: 8px;
              margin: 0;
              padding: 0;
              max-width: 20%;
              height: auto;"/>
              <img src=${StarIcon} alt="Star 3" style="
              border-radius: 8px;
              margin: 0;
              padding: 0;
              max-width: 20%;
              height: auto;"/>
              <img src=${StarIcon} alt="Star 4" style="
              border-radius: 8px;
              margin: 0;
              padding: 0;
              max-width: 20%;
              height: auto;"/>
              <img src=${StarIcon} alt="Star 5" style="
              border-radius: 8px;
              margin: 0;
              padding: 0;
              max-width: 20%;
              height: auto;"/>
            </div>
            <div className="icon-container-right-column" style="
            margin: 0;
            padding: 0;
            margin-left: 5%;
            flex: 30%;">
              <img src=${CouponIcon} alt="Coupon" style="
              margin-top: 8%;
              border-radius: 8px;
              flex: 1;
              padding: 1%;
              width: 60%;
              height: auto;"/>
            </div>
            <div className="icon-container-right-column-2" style="
            margin: 0;
            padding: 0;
            flex: 20%;">
            <button id="room-details-button-${title}" style={{margin: "0%"}}>Details</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Append the new card to the cards container
    cardsContainer = document.querySelector('.cards-container');
    cardsContainer.insertAdjacentHTML('beforeend', newCardHTML);
    const detailsButton = document.getElementById("room-details-button-" + title);
    detailsButton.addEventListener('click', (e) => handleOpenDetails(e, roomId));
  });

  const handleChange = e => {
    // Update input state when input values change
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleOpenDetails = async (e, roomId) => {
    // Handle click event to open details page for a room
    e.preventDefault();
    changeLastRoomClickedID(roomId);
    navigate("/details");
  }

  const fetchDataFromServer = async () => {
    // Fetch data from the server to display rooms
    try {
      cardsContainer = document.querySelector('.cards-container');
      const roomsResponse = await axios.get("/rooms");
      const imageFilesResponse = await axios.get(`/files/retrieve_images`);
      let imageIndex = 0;
      emptyContainer(cardsContainer);
      roomsResponse.data.forEach(room => {
        if (imageIndex >= imageFilesResponse.data.length) {
          updateContainer(cardsContainer);
          return;
        }
        const imagePath = "/upload/" + imageFilesResponse.data[imageIndex].filename;
        addCardToUI(room.title, room.description, imagePath, room.roomid);
        imageIndex++;
      });
      updateContainer(cardsContainer);
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error, false, navigate);
    }
  };

  useEffect(() => {
    // Fetch data when component mounts
    cardsContainer = document.querySelector('.cards-container');
    if (!isLoggedIn) {
      return;
    }
    fetchDataFromServer();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchTerm = inputs.searchQuery;
    if (searchTerm === '') {
      return;
    } else {
      try {
        cardsContainer = document.querySelector('.cards-container');
        // Retrieve rooms search results using Axios
        const searchResults = await axios.get(`/filters/search_by_title${searchTerm}`);
        // Retrieve image files using Axios
        const imageFiles = await axios.get(`/files/retrieve_images`);
        let imageIndex = 0;
        // Filter image files array to include only images of rooms matching search results
        imageFiles.data = imageFiles.data.filter(image => {
          return searchResults.data.some(resImage => resImage.image_id === image.imageid);
        });
        emptyContainer(cardsContainer);
        searchResults.data.forEach(room => {
          // If no more images are available, update container and exit loop
          if (imageIndex >= imageFiles.data.length) {
            updateContainer(cardsContainer);
            return;
          }
          const imagePath = "/upload/" + imageFiles.data[imageIndex].filename;
          addCardToUI(room.title, room.description, imagePath, room.roomid);
          imageIndex++;
        });
        updateContainer(cardsContainer);
        return;
      } catch (error) {
        showErrorDialog("An error occurred:", error, false, navigate);
      }
    }
  }


  const toggleModal = (e) => {
    e.preventDefault();
    setModalVisible(!modalVisible);
  };

  const handleFilterCalendarChange = async (newDatesRange, event) => {
    cardsContainer = document.querySelector('.cards-container');
    // Prevent default form submission behavior
    event.preventDefault();
    // Update selected dates
    setSelectedDates(newDatesRange);

    // Convert dates to ISO string format
    const checkInDate = newDatesRange[0].toISOString().slice(0, 19).replace('T', ' ');
    const checkOutDate = newDatesRange[1].toISOString().slice(0, 19).replace('T', ' ');

    // Prepare request parameters
    const requestParams = {
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
    };

    try {
      // Fetch available rooms based on the selected dates
      const availableRoomsResponse = await axios.get('/filters/search_available_rooms', { params: requestParams });
      emptyContainer(cardsContainer);
      for (const room of availableRoomsResponse.data) {
        // Fetch room details by room ID
        const roomDetailsResponse = await axios.get(`/rooms/by_roomID${room.roomid}`);
        // Fetch room image by image ID
        const roomImage = await axios.get(`/files/get_image_by_id${roomDetailsResponse.data[0].image_id}`);
        // Construct room image path
        const roomImagePath = "/upload/" + roomImage.data[0].filename;
        // Add room card to the UI
        addCardToUI(room.title, room.description, roomImagePath, room.roomid);
      }
      // Update UI container with new room cards
      updateContainer(cardsContainer);
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error, false, navigate);
    }
  }

  return (isLoggedIn ? // Check if user is logged in
    <div className='body'>
      <form>
        <div className="search-container"> {/* Container for search */}
          {/* Input for search query */}
          <input type="text" name="searchQuery" id="searchQuery" onChange={handleChange} placeholder="Enter your search query" />
          {/* Button for search */}
          <button className="searchImg">
            <img src={SearchIcon} alt="Search" id="searchImg" onClick={handleSearch} />
          </button>
          {/* Button for filter, toggle modal visibility */}
          <button className={modalVisible ? 'active' : ''} id="filter-button" onClick={toggleModal}>
            {modalVisible ? 'X' : 'Filter'}
          </button>
          {/* Modal for filter options, visible if modalVisible is true */}
          {modalVisible && (
            <div className="filter-modal" id="filter-modal">
              <div className='calendar-container'> {/* Container for calendar */}
                {/* Calendar component for selecting date range */}
                <Calendar className="filter-calendar"
                  onChange={(newDatesRange, event) => handleFilterCalendarChange(newDatesRange, event)}
                  value={selectedDates}
                  selectRange={true}
                />
              </div>
            </div>
          )}
        </div>
      </form>

      <div className="cards-container"> {/* Container for cards */}
      </div>
    </div > // End of body section
    // Error message if user is not logged in
    : <div>{showErrorDialog("Error: ", "Login to access", true, navigate)}</div>)
}

export default Home;