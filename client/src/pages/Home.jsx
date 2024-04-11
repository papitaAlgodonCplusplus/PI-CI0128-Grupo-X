import React, { useState, useEffect, useContext } from 'react'
import '../styles.scss';
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import Star from "../img/Star.png"
import Search from "../img/Search.png"
import Filter from "../img/Filter.png"
import Coupon from "../img/Coupon.png"
import User from "../img/User.png"
import { Context } from '../Context.js';

const Home = () => {
  const addCard = (title, description, filename, id) => {
    const cardsContainer = document.querySelector('.cards-container');

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
      <div><img src="${filename}" alt="View of the room" style="width: 360px;
      height: 220px;
      border-radius: 8px;"></img></div>
      <div>
        <h2 style="
        margin: 0;
        position: static;"><center>${title}</center></h2>
        <p style="
        margin: 3%;
        position: static;
        display: -webkit-box;
        overflow: hidden;
        -webkit-line-clamp: 7;
        -webkit-box-orient: vertical;">${description}</p>
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
            <img src=${Star} alt="Star 1" style="
            border-radius: 8px;
            margin: 0;
            padding: 0;
            max-width: 20%;
            height: auto;"/>
            <img src=${Star} alt="Star 2" style="
            border-radius: 8px;
            margin: 0;
            padding: 0;
            max-width: 20%;
            height: auto;"/>
            <img src=${Star} alt="Star 3" style="
            border-radius: 8px;
            margin: 0;
            padding: 0;
            max-width: 20%;
            height: auto;"/>
            <img src=${Star} alt="Star 4" style="
            border-radius: 8px;
            margin: 0;
            padding: 0;
            max-width: 20%;
            height: auto;"/>
            <img src=${Star} alt="Star 5" style="
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
            <img src=${Coupon} alt="Coupon" style="
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

    cardsContainer.insertAdjacentHTML('beforeend', newCardHTML);
    const detailsButton = document.getElementById("room-details-button-" + title);
    detailsButton.addEventListener('click', (e) => handleOpen(e, id));
  };

  const [inputs, setInputs] = useState({
    name: "",
    desc: "",
    search: "",
    delete: "",
    filename: "",
  })

  const handleChange = e => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
    console.log(inputs)
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
  }

  const { changeLastRoomClickedID } = useContext(Context);

  const navigate = useNavigate();
  const handleOpen = async (e, id) => {
    e.preventDefault();
    changeLastRoomClickedID(id);
    navigate("/details");
  }

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/rooms");
        console.log ("Rooms: ", res)
        setRooms(res.data)
        const filenames = await axios.get(`/files/retrieve_images`);
        console.log ("Images: ", filenames)
        var i = 0;
        emptyCardContainer();
        res.data.forEach(room => {
          if (i >= filenames.data.length) {
            updateCardsContainer();
            return;
          }
          const filepath = "/upload/" + filenames.data[i].filename;
          addCard(room.title, room.description, filepath, room.roomid);
          i++;
        });
        updateCardsContainer();
        return;
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }
    };

    fetchData();
  }, []);

  function updateCardsContainer() {
    const cardsContainer = document.querySelector('.cards-container');
    cardsContainer.style.gridAutoRows = 'auto';
    cardsContainer.style.gridAutoFlow = 'dense';
  }
 
  const emptyCardContainer = () => {
    const cardsContainer = document.querySelector('.cards-container');
    cardsContainer.innerHTML = '';
    updateCardsContainer();
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = inputs.search;
    console.log(term)
    if (term === '') {
      try {
        const res = await axios.get("/rooms");
        setRooms(res.data)
        const filenames = await axios.get(`/files/retrieve_images`);
        var i = 0;
        emptyCardContainer();
        res.data.forEach(room => {
          if (i >= filenames.data.length) {
            updateCardsContainer();
            return;
          }
          const filepath = "/upload/" + filenames.data[i].filename;
          addCard(room.title, room.description, filepath, room.roomid);
          i++;
        });
        updateCardsContainer();
        return;
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }
    } else {
      try {
        const res = await axios.get(`/filters/search_by_title${term}`);
        setRooms(res.data);
        console.log(res)
        const images = await axios.get(`/files/retrieve_images`);
        console.log(images)
        i = 0;
        images.data = images.data.filter(image => {
          return res.data.some(resImage => resImage.image_id === image.imageid);
        });
        console.log(images.data);
        emptyCardContainer();
        res.data.forEach(room => {
          if (i >= images.data.length) {
            updateCardsContainer();
            return;
          }
          const filepath = "/upload/" + images.data[i].filename;
          addCard(room.title, room.description, filepath, room.roomid);
          i++;
        });
        updateCardsContainer();
        return;
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }
    }
  }

  return (
    <div>
      <form>
        <div className="search-container">
          <input type="text" name="search" id="search" onChange={handleChange} placeholder="Enter your search query" />
          <button className="searchImg">
            <img src={Search} alt="Search" id="searchImg" onClick={handleSearch} />
          </button>
          <button className="filterImg">
            <img src={Filter} alt="Filter" id="filterImg"/>
          </button>
        </div>
      </form>

      <div className="cards-container">
      </div>
    </div >
  )
}

export default Home;