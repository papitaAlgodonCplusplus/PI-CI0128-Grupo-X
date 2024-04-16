/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react'
import '../styles.scss';
import axios from "axios"
import X from "../img/X.png"
import Plus from "../img/Add.png"

const Rooms = () => {
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

  const [inputs, setInputs] = useState({
    name: "",
    desc: "",
    search: "",
    delete: "",
    filename: "",
    room_type: 0,
    room_type_name: "",
    room_type_price: 0,
  })

  const addRoomType = (title, price, id) => {
    const roomsTypeContainer = document.querySelector('.rooms_type-container');

    const newRoomTypeHTML = `
    <div class="list-item" style="margin-left: 28%; width: 40%">
      <div>
        <h3 style="color: white; 
        word-wrap: break-word;
        max-width: 240px">${title}</h3>
        <p style="color: white; 
        word-wrap: break-word;
        max-width: 240px">Price: ${price}</p>
      </div>
        <button class="delete-button" id="delete-room_type-button-${title}">
          <img src=${X} alt="X" id="XImg" style="width:40px; height:40px; background-color: transparent;"/>
        </button>
    </div>
  `;

    roomsTypeContainer.insertAdjacentHTML('beforeend', newRoomTypeHTML);
    const deleteButton = document.getElementById("delete-room_type-button-" + title);
    deleteButton.addEventListener('click', (e) => handleRoomTypeDelete(e, id));
  };

  const addCard = (title, description, room_type, filename, id) => {
    description = description.substring(0, 90);
    const cardsContainer = document.querySelector('.list-container');

    const newCardHTML = `
    <div class="list-item">
      <img src="${filename}" alt="${filename}"/>
      <div>
        <h3 style="
        word-wrap: break-word;
        max-width: 240px;">${title}</h3>
        <h3 style="
        word-wrap: break-word;
        max-width: 240px;">Room Type: ${room_type}</h3>
        <p style="
        word-wrap: break-word;
        max-width: 240px;">${description}</p>
      </div>
        <button class="delete-button" id="delete-room-button-${title}">
          <img src=${X} alt="X" id="XImg" style="width:40px; height:40px; background-color: transparent;"/>
        </button>
    </div>
  `;

    cardsContainer.insertAdjacentHTML('beforeend', newCardHTML);
    const deleteButton = document.getElementById("delete-room-button-" + title);
    deleteButton.addEventListener('click', (e) => handleDelete(e, id));
  };

  function updateRoomTypesContainer() {
    const cardsContainer = document.querySelector('.rooms_type-container');
    cardsContainer.style.gridAutoRows = 'auto';
    cardsContainer.style.gridAutoFlow = 'dense';
  }

  const emptyRoomTypesContainer = () => {
    const cardsContainer = document.querySelector('.rooms_type-container');
    cardsContainer.innerHTML = '';
    updateCardsContainer();
  }

  function updateCardsContainer() {
    const cardsContainer = document.querySelector('.list-container');
    cardsContainer.style.gridAutoRows = 'auto';
    cardsContainer.style.gridAutoFlow = 'dense';
  }

  const emptyCardContainer = () => {
    const cardsContainer = document.querySelector('.list-container');
    cardsContainer.innerHTML = '';
    updateCardsContainer();
  }


  const [roomTypeOption, setRoomTypeOption] = useState('');
  const handleRoomTypeChange = (e) => {
    setRoomTypeOption(e.target.value);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get('/rooms/room_types')
      setRoomTypes(res.data);
      setRoomTypeOption(res.data[0].categoryid);
      emptyRoomTypesContainer();
      res.data.forEach(room_type => {
        addRoomType(room_type.class_name, room_type.price, room_type.categoryid);
      });
      updateRoomTypesContainer();
      const res2 = await axios.get("/rooms");
      const filenames = await axios.get(`/files/retrieve_images`);
      var i = 0;
      emptyCardContainer();
      res2.data.forEach(room => {
        if (i >= filenames.data.length) {
          updateCardsContainer();
          return;
        }
        const filepath = "/upload/" + filenames.data[i].filename;
        addCard(room.title, room.description, res.data[room.type_of_room - 1].class_name, filepath, room.roomid);
        console.log(room_types)
        i++;
      });
      updateCardsContainer();
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoomTypeDelete = async (e, id) => {
    e.preventDefault()
    try {
      await axios.delete(`/rooms/delete_room_type${id}`);
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
    fetchData();
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    try {
      await axios.delete(`/rooms/delete${id}`);
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
    fetchData();
  }

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];
    const imagePreview = document.getElementById('image-preview');

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
      };

      reader.readAsDataURL(file);
      setFile(e.target.files[0]);
    } else {
      imagePreview.src = '#';
      imagePreview.style.display = 'none';
    }
  };

  async function postDataWithTimeout(url, data, timeout) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(null);
      }, timeout);

      axios.post(url, data)
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

  const handleRoomTypeSubmit = async e => {
    e.preventDefault()
    if (!inputs.room_type_name) {
      showErrorDialog("An error occurred:", "Please add a room type name");
      return;
    }
    if (!inputs.room_type_price) {
      showErrorDialog("An error occurred:", "Please add a price");
      return;
    }
    try {
      await postDataWithTimeout("/rooms/add_room_type", inputs, 500);
      fetchData();
      closeRoomTypeModal();
      return;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data;
        showErrorDialog("An error occurred:", errorMessage);
      } else {
        showErrorDialog("An error occurred:", error);
      }
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) {
      showErrorDialog("An error occurred:", "Please upload an image");
      return;
    }
    if (!inputs.name) {
      showErrorDialog("An error occurred:", "Please add a title");
      return;
    }
    if (!inputs.desc) {
      showErrorDialog("An error occurred:", "Please add a description");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('image', file);
      var filename = "";

      filename = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      Object.entries(inputs).forEach(([key, value]) => {
        formData.append(key, value);
      });

      inputs.filename = filename;
      inputs.room_type = roomTypeOption;

      const res_add = await postDataWithTimeout("/rooms/add_room", inputs, 500);
      console.log("Rooms added successfully", res_add);
      fetchData();
      closeModal()
      return;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data;
        showErrorDialog("An error occurred:", errorMessage);
      } else {
        showErrorDialog("An error occurred:", error);
      }
    }
  }

  function displayRoomTypeModal() {
    var modal = document.getElementById("roomTypeModal");
    modal.style.display = "block";
  }

  function closeRoomTypeModal() {
    var modal = document.getElementById("roomTypeModal");
    modal.style.display = "none";
  }

  function displayModal() {
    var modal = document.getElementById("myFormModal");
    modal.style.display = "block";
  }

  function closeModal() {
    var modal = document.getElementById("myFormModal");
    modal.style.display = "none";
  }

  const handleChange = e => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const [room_types, setRoomTypes] = useState([]);
  return (
    <div className='body'>
      <div id="myFormModal" className="form-modal">
        <div className="form-modal-content">
          <span className="close" onClick={closeModal}>&times;</span>
          <form id="myForm">
            <div className="file-input-container">
              <input type="file" id="file-input" className="file-input" onChange={handleFileChange} />
              <label htmlFor="file-input" className="file-input-label">Choose an image</label>
              <img id="image-preview" className="image-preview" src="#" alt="Preview" />
            </div>
            <label htmlFor="name">Title</label><br />
            <input type="text" id="name" name="name" onChange={handleChange} /><br />
            <label htmlFor="desc">Description</label><br />
            <textarea id="desc" name="desc" onChange={handleChange} ></textarea>
            <label htmlFor="room_types_selector">Room Type</label><br />
            <select name="room_types_selector" className="room_types_selector" id="room_types_selector_1"
              onChange={handleRoomTypeChange} value={roomTypeOption} required>
              {room_types.map(room_type => (
                <option key={room_type.categoryid} value={room_type.categoryid}>{room_type.class_name}</option>
              ))}
            </select>
            <button className="Plus">
              <img src={Plus} alt="Plus" id="plusImg" onClick={handleSubmit} />
            </button>
          </form>
        </div>
      </div>
      <div id="roomTypeModal" className="form-modal">
        <div className="form-modal-content">
          <span className="close" onClick={closeRoomTypeModal}>&times;</span>
          <form id="myForm">
            <label htmlFor="room_type_name">Room Type Name</label><br />
            <input type="text" id="room_type_name" name="room_type_name" onChange={handleChange} /><br />
            <label htmlFor="room_type_price">Room Type Price</label><br />
            <input type="number" id="room_type_price" name="room_type_price" onChange={handleChange} /><br />
            <button className="Plus">
              <img src={Plus} alt="Plus" id="plusImg" onClick={handleRoomTypeSubmit} />
            </button>
          </form>
        </div>
      </div>
      <div className='admin-container'>
        <div>
          <h1 className='room_types-title'><center>Room Types</center></h1>
          <div className="rooms_type-container">
          </div>
          <button className="add-room-type-button" onClick={displayRoomTypeModal}><center>Add Room Type</center></button>
        </div>
        <div>
          <h1 className='rooms-title'><center>Rooms</center></h1>
          <div className="list-container">
          </div>
          <button className="add-room-button" onClick={displayModal}><center>Add Room</center></button>
        </div>
      </div>
    </div >
  );
};



export default Rooms;