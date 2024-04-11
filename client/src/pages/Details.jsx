import React, { useState, useEffect, useContext, useRef } from 'react'
import '../styles.scss';
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import Star from "../img/Star.png"
import Search from "../img/Search.png"
import Filter from "../img/Filter.png"
import Coupon from "../img/Coupon.png"
import User from "../img/User.png"
import Img1 from "../img/Img1.png"
import { Context } from '../Context';

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

const Details = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const { lastRoomClickedID } = useContext(Context);
  const imgRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomID = lastRoomClickedID
        const res = await axios.get(`/filters/retrieve_room${roomID}`);
        const image = await axios.get(`/files/get_image_by_id${res.data[0].image_id}`)
        console.log("Fetched: ", res, "and: ", image)
        imgRef.current = "/upload/" + image.data[0].filename;
        titleRef.current = res.data[0].title
        descRef.current = res.data[0].description
        setDataLoaded(true);
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="square-container">
        <div className="label-container">
          <div className="labelPlus">Label 1</div>
          <div className="labelPlus">Label 2</div>
          <div className="labelPlus">Label 3</div>
        </div>
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
        {dataLoaded && <img src={imgRef.current} alt="RoomExample" className="details-image" />}
        <button className="reservation-button"><center>Book</center></button>
      </div>
      <div className="square-container-2">
        <div className='square-container-2-left'>
          {dataLoaded && <h2 className='square-container-2-left-item'>{titleRef.current}</h2>}
          {dataLoaded && <p className='square-container-2-left-item'>{descRef.current}</p>}
          <div className='square-container-2-left-item'>
          </div>
        </div>
        <div className='square-container-2-right'>
          {dataLoaded && <img className='square-container-2-right-item' src={imgRef.current} alt="Owner" />}
        </div>
      </div>
      <div className="square-container-3">
        <p className='user-review'>Lorem ipsum dolor sit amet consectetur adipiscing elit fringilla, duis egestas cursus aliquet nascetur ut hac curabitur, dictum euismod consequat aptent quis posuere sociosqu. Gravida imperdiet duis fames fringilla rhoncus eros euismod vulputate dictumst tortor faucibus volutpat, venenatis inceptos ante auctor nulla dignissim tincidunt hac himenaeos sem vehicula. Sed congue justo mauris varius aliquet primis fames placerat, in vehicula magna class volutpat magnis dis facilisis, torquent phasellus eleifend etiam porttitor vitae convallis.</p>
        <div className="icon-container" style={{ width: "20%", padding: "0%", margin: "0%", marginLeft: "27%" }}>
          <div className="icon-container-left-column">
            <img src={Star} alt="Star 1" />
            <img src={Star} alt="Star 2" />
            <img src={Star} alt="Star 3" />
            <img src={Star} alt="Star 4" />
            <img src={Star} alt="Star 5" />
          </div>
          <div className="icon-container-right-column-2">
            <img src={User} alt="Owner" style={{ width: "70%", marginLeft: "20%", marginBottom: "12%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};



export default Details;