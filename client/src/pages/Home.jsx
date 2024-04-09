import React, { useState, useEffect } from 'react'
import '../styles.scss';
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import Star from "../img/Star.png"
import Search from "../img/Search.png"
import Filter from "../img/Filter.png"
import Img1 from "../img/Img1.png"
import Coupon from "../img/Coupon.png"
import User from "../img/User.png"

const Home = () => {
  const addCard = (title, description, filename) => {
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
            <img src=${User} alt="Owner" style="
            flex: 1;
            width: 100%;
            height: auto;"/>
          </div>
        </div>
      </div>
    </div>
  `;

    cardsContainer.insertAdjacentHTML('beforeend', newCardHTML);
  };

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/rooms");
        setRooms(res.data)
        const filenames = await axios.get(`/rooms/get_images_names`);
        var i = 0;
        emptyCardContainer();
        res.data.forEach(room => {
          if (i >= filenames.data.length) {
            updateCardsContainer();
            return;
          }
          const filepath = "/upload/" + filenames.data[i].filename;
          addCard(room.title, room.description, filepath);
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

  const navigate = useNavigate()
  const handleSubmit = async e => {
    e.preventDefault()
    if (!file){
      showErrorDialog("An error occurred:", "Please upload an image");
      return;
    }
    if (!inputs.name){
      showErrorDialog("An error occurred:", "Please add a title");
      return;
    }
    if (!inputs.desc){
      showErrorDialog("An error occurred:", "Please add a description");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('image', file);
      var filename = "";
      try {
        filename = await axios.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }

      Object.entries(inputs).forEach(([key, value]) => {
        formData.append(key, value);
      });

      inputs.filename = filename;

      await axios.post("/rooms/add_room", inputs)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data;
        showErrorDialog("An error occurred:", errorMessage);
      } else {
        console.log("Even here 2")
        showErrorDialog("An error occurred:", error);
      }
    }

    const filepath = "/upload/" + filename.data;
    addCard(inputs.name, inputs.desc, filepath);
    updateCardsContainer();
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
        const filenames = await axios.get(`/rooms/get_images_names`);
        var i = 0;
        emptyCardContainer();
        res.data.forEach(room => {
          if (i >= filenames.data.length) {
            updateCardsContainer();
            return;
          }
          const filepath = "/upload/" + filenames.data[i].filename;
          addCard(room.title, room.description, filepath);
          i++;
        });
        updateCardsContainer();
        return;
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }
    } else {
      try {
        const res = await axios.get(`/rooms/search${term}`);
        setRooms(res.data);
        const images = await axios.get(`/rooms/get_images`);
        var i = 0;
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
          addCard(room.title, room.description, filepath);
          i++;
        });
        updateCardsContainer();
        return;
      } catch (error) {
        showErrorDialog("An error occurred:", error);
      }
    }
  }

  const handleDelete = async e => {
    e.preventDefault()
    try {
      const roomId = inputs.delete;
      await axios.delete(`/rooms/delete${roomId}`);
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
    try {
      const res = await axios.get(`/rooms`);
      setRooms(res.data);
      const filenames = await axios.get(`/rooms/get_images_names`);
      var i = 0;
      emptyCardContainer();
      res.data.forEach(room => {
        if (i >= filenames.data.length) {
          updateCardsContainer();
          return;
        }
        const filepath = "/upload/" + filenames.data[i].filename;
        addCard(room.title, room.description, filepath);
        i++;
      });
      updateCardsContainer();
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  }

  return (
    <div>
      <div>
        <input type="file" onChange={handleFileChange} />
      </div>
      <form id="myForm">
        <label htmlFor="name">Name:</label><br />
        <input type="text" id="name" name="name" onChange={handleChange} /><br />
        <label htmlFor="delete">Delete:</label><br />
        <input type="text" id="delete" name="delete" onChange={handleChange} /><br />
        <label htmlFor="desc">Description:</label><br />
        <textarea id="desc" name="desc" onChange={handleChange} ></textarea>
        <button className="filterImg">
          <img src={Filter} alt="Filter" id="filterImg" onClick={handleDelete} />
        </button>
      </form>
      <form>
        <div className="search-container">
          <input type="text" name="search" id="search" onChange={handleChange} placeholder="Enter your search query" />
          <button className="searchImg">
            <img src={Search} alt="Search" id="searchImg" onClick={handleSearch} />
          </button>
          <button className="filterImg">
            <img src={Filter} alt="Filter" id="filterImg" onClick={handleSubmit} />
          </button>
        </div>
      </form>

      <div className="cards-container">
      </div>
    </div >
  )
}

export default Home;