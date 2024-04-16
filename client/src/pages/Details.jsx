/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useRef } from 'react'
import '../styles.scss';
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Star from "../img/Star.png"
import User from "../img/User.png"
import { Context } from '../Context';
import { showErrorDialog } from '../Misc';

const Details = () => {
  // State and refs initialization
  const [dataLoaded, setDataLoaded] = useState(false); // State to track if data is loaded
  const { lastRoomClickedID } = useContext(Context); // Context for the ID of the last clicked room
  const imgRef = useRef(null); // Ref for image
  const titleRef = useRef(null); // Ref for title
  const descRef = useRef(null); // Ref for description

  const navigate = useNavigate(); // Hook for navigation

  // Function to handle booking
  const handleBook = async e => {
    navigate("/reservation"); // Navigate to reservation page
  }

  // Function to fetch data
  const fetchData = async () => {
    try {
      const roomID = lastRoomClickedID; // Get the ID of the room
      const res = await axios.get(`/filters/retrieve_room${roomID}`); // Fetch room data
      const image = await axios.get(`/files/get_image_by_id${res.data[0].image_id}`); // Fetch image
      imgRef.current = "/upload/" + image.data[0].filename; // Set image reference
      titleRef.current = res.data[0].title; // Set title reference
      descRef.current = res.data[0].description; // Set description reference
      setDataLoaded(true); // Set data loaded to true
    } catch (error) {
      showErrorDialog("An error occurred:", error, false, navigate); // Show error dialog
    }
  };

  // Effect hook to fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className='body'>
      {/* Main container */}
      <div className="square-container">
        {/* Labels container */}
        <div className="label-container">
          <div className="labelPlus">Label 1</div>
          <div className="labelPlus">Label 2</div>
          <div className="labelPlus">Label 3</div>
        </div>
        {/* Room details */}
        {dataLoaded && <p className="room-text-details">{descRef.current}</p>}
        <ul className='room-details-list'>
          <li>Item A</li>
          <li>Item B</li>
          <li>Item C</li>
          <li>Item D</li>
          <li>Item E</li>
          <li>Item F</li>
          <li>Item G</li>
        </ul>
        <ul className='room-details-list-2'>
          <li>Item A</li>
          <li>Item B</li>
          <li>Item C</li>
          <li>Item D</li>
          <li>Item E</li>
          <li>Item F</li>
          <li>Item G</li>
        </ul>
        {/* Room image */}
        {dataLoaded && <img src={imgRef.current} alt="RoomExample" className="details-image" />}
        {/* Button to book */}
        <button className="reservation-button" onClick={handleBook}><center>Book</center></button>
      </div>
      {/* Square container 2 */}
      <div className="square-container-2">
        {/* Left side */}
        <div className='square-container-2-left'>
          {dataLoaded && <h2 className='square-container-2-left-item'>{titleRef.current}</h2>}
          {dataLoaded && <p className='square-container-2-left-item'>{descRef.current}</p>}
          <div className='square-container-2-left-item'></div>
        </div>
        {/* Right side */}
        <div className='square-container-2-right'>
          {dataLoaded && <img className='square-container-2-right-item' src={imgRef.current} alt="Owner" />}
        </div>
      </div>
      {/* Square container 3 */}
      <div className="square-container-3">
        {/* User review */}
        <p className='user-review'>Lorem ipsum dolor sit amet consectetur adipiscing elit fringilla, duis egestas cursus aliquet nascetur ut hac curabitur, dictum euismod consequat aptent quis posuere sociosqu. Gravida imperdiet duis fames fringilla rhoncus eros euismod vulputate dictumst tortor faucibus volutpat, venenatis inceptos ante auctor nulla dignissim tincidunt hac himenaeos sem vehicula. Sed congue justo mauris varius aliquet primis fames placerat, in vehicula magna class volutpat magnis dis facilisis, torquent phasellus eleifend etiam porttitor vitae convallis.</p>
        {/* Icon container */}
        <div className="icon-container" style={{ width: "20%", padding: "0%", margin: "0%", marginLeft: "27%" }}>
          <div className="icon-container-left-column">
            {/* Star icons */}
            <img src={Star} alt="Star 1" />
            <img src={Star} alt="Star 2" />
            <img src={Star} alt="Star 3" />
            <img src={Star} alt="Star 4" />
            <img src={Star} alt="Star 5" />
          </div>
          <div className="icon-container-right-column-2">
            {/* User icon */}
            <img src={User} alt="Owner" style={{ width: "70%", marginLeft: "20%", marginBottom: "12%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
