/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useCallback } from 'react'
import '../styles.scss';
import axios from "axios"
import X from "../img/X.png"
import Plus from "../img/Add.png"
import { showErrorDialog, updateContainer, emptyContainer, postDataWithTimeout } from '../Misc';
import { AuthContext } from '../AuthContext.js';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
  const navigate = useNavigate()
  const { userRol } = useContext(AuthContext);
  const [roomTypeOption, setRoomTypeOption] = useState('');
  const [file, setFile] = useState(null);
  const [room_types, setRoomTypes] = useState([]);
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

  // Function to add a room type to the UI
  const addRoomType = (title, price, id) => {
    // Selecting the container for room types
    const roomsTypeContainer = document.querySelector('.rooms_type-container');

    // Generating HTML for the new room type
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
      <!-- Delete button for the room type -->
      <button class="delete-button" id="delete-room_type-button-${title}">
        <img src=${X} alt="X" id="XImg" style="width:40px; height:40px; background-color: transparent;"/>
      </button>
    </div>
  `;

    // Inserting the new room type HTML into the container
    roomsTypeContainer.insertAdjacentHTML('beforeend', newRoomTypeHTML);

    // Adding event listener to the delete button
    const deleteButton = document.getElementById("delete-room_type-button-" + title);
    deleteButton.addEventListener('click', (e) => handleRoomTypeDelete(e, id));
  };

  // Function to add a card to the UI
  const addCard = (title, description, room_type, filename, id) => {
    // Truncating description to fit into card display
    description = description.substring(0, 90);

    // Selecting the container for cards
    const cardsContainer = document.querySelector('.list-container');

    // Generating HTML for the new card
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
      <!-- Delete button for the card -->
      <button class="delete-button" id="delete-room-button-${title}">
        <img src=${X} alt="X" id="XImg" style="width:40px; height:40px; background-color: transparent;"/>
      </button>
    </div>
  `;

    // Inserting the new card HTML into the container
    cardsContainer.insertAdjacentHTML('beforeend', newCardHTML);

    // Adding event listener to the delete button
    const deleteButton = document.getElementById("delete-room-button-" + title);
    deleteButton.addEventListener('click', (e) => handleDelete(e, id));
  };

  const handleRoomTypeChange = (e) => {
    setRoomTypeOption(e.target.value);
  };

  // Function to fetch data and populate UI
  const fetchData = useCallback(async () => {
    // if (userRol !== "admin" && userRol !== "employee") {
    //   return;
    // }
    // Selecting containers for room types and cards
    const roomTypesContainer = document.querySelector('.rooms_type-container');
    const cardsContainer = document.querySelector('.list-container');

    try {
      // Fetching room types data
      const roomTypesResponse = await axios.get('/rooms/room_types');

      // Setting room types state and default room type option
      if (roomTypesResponse.data[0]) {
        setRoomTypes(roomTypesResponse.data);
        setRoomTypeOption(roomTypesResponse.data[0].categoryid);
      }

      // Clearing room types container
      emptyContainer(roomTypesContainer);

      // Adding room types to UI
      roomTypesResponse.data.forEach(room_type => {
        addRoomType(room_type.class_name, room_type.price, room_type.categoryid);
      });

      // Updating room types container
      updateContainer(roomTypesContainer);

      // Fetching rooms data
      const roomsResponse = await axios.get("/rooms");

      // Fetching filenames of room images
      const filenamesResponse = await axios.get(`/files/retrieve_images`);
      var i = 0;

      // Clearing cards container
      emptyContainer(cardsContainer);

      // Adding cards for each room to UI
      roomsResponse.data.forEach(room => {
        if (i >= filenamesResponse.data.length) {
          // If there are no more filenames, update container and return
          updateContainer(cardsContainer);
          return;
        }

        // Generating filepath for room image
        const filepath = "/upload/" + filenamesResponse.data[i].filename;

        let selectedRoomType;
        
        // Retrieve categoryid that equals room's room type
        for (let i = 0; i < roomTypesResponse.data.length; i++) {
          if (roomTypesResponse.data[i].categoryid === room.type_of_room) {
            selectedRoomType = roomTypesResponse.data[i];
            break;
          }
        }

        // Adding card for the room to UI
        addCard(room.title, room.description, selectedRoomType.class_name, filepath, room.roomid);
        i++;
      });

      // Updating cards container
      updateContainer(cardsContainer);

      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
  });


  useEffect(() => {
    fetchData();
  }, []);

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

  // Function to handle file input change
  const handleFileChange = (e) => {
    // Getting the file input element
    const fileInput = e.target;

    // Getting the selected file
    const file = fileInput.files[0];

    // Getting the image preview element
    const imagePreview = document.getElementById('image-preview');

    if (file) {
      // If a file is selected
      const reader = new FileReader();

      // Function to handle when file reading is completed
      reader.onload = function (e) {
        // Displaying the image preview
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
      };

      // Reading the selected file as data URL
      reader.readAsDataURL(file);

      // Setting the file state
      setFile(e.target.files[0]);
    } else {
      // If no file is selected, reset the image preview
      imagePreview.src = '#';
      imagePreview.style.display = 'none';
    }
  };

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

  // Function to handle form submission
  const handleSubmit = async e => {
    e.preventDefault(); // Preventing default form submission behavior

    // Validating file upload
    if (!file) {
      showErrorDialog("An error occurred:", "Please upload an image");
      return;
    }

    // Validating title
    if (!inputs.name) {
      showErrorDialog("An error occurred:", "Please add a title");
      return;
    }

    // Validating description
    if (!inputs.desc) {
      showErrorDialog("An error occurred:", "Please add a description");
      return;
    }

    try {
      // Creating FormData object for form data
      const formData = new FormData();
      formData.append('image', file);
      var filename = "";

      // Uploading image file
      filename = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Appending other form data to FormData object
      Object.entries(inputs).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Setting filename in inputs
      inputs.filename = filename;
      inputs.room_type = roomTypeOption;

      // Adding room data to database
      await postDataWithTimeout("/rooms/add_room", inputs, 500);
      fetchData();
      closeModal();
      return;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Handling specific error response
        const errorMessage = error.response.data;
        showErrorDialog("An error occurred:", errorMessage);
      } else {
        // Handling generic error
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

  // userRol === "admin" || userRol === "employee" ?
  return (
    <div className='body'>
      {/* Form modal for adding rooms */}
      <div id="myFormModal" className="form-modal">
        <div className="form-modal-content">
          <span className="close" onClick={closeModal}>&times;</span>
          <form id="myForm">
            {/* File input for uploading image */}
            <div className="file-input-container">
              <input type="file" id="file-input" className="file-input" onChange={handleFileChange} />
              <label htmlFor="file-input" className="file-input-label">Choose an image</label>
              <img id="image-preview" className="image-preview" src="#" alt="Preview" />
            </div>
            {/* Input field for room title */}
            <label htmlFor="name">Title</label><br />
            <input type="text" id="name" name="name" onChange={handleChange} /><br />
            {/* Textarea for room description */}
            <label htmlFor="desc">Description</label><br />
            <textarea id="desc" name="desc" onChange={handleChange} ></textarea>
            {/* Dropdown for selecting room type */}
            <label htmlFor="room_types_selector">Room Type</label><br />
            <select name="room_types_selector" className="room_types_selector" id="room_types_selector_1"
              onChange={handleRoomTypeChange} value={roomTypeOption} required>
              {/* Mapping room types to options */}
              {room_types.map(room_type => (
                <option key={room_type.categoryid} value={room_type.categoryid}>{room_type.class_name}</option>
              ))}
            </select>
            {/* Button to add room */}
            <button className="Plus">
              <img src={Plus} alt="Plus" id="plusImg" onClick={handleSubmit} />
            </button>
          </form>
        </div>
      </div>
      {/* Form modal for adding room type */}
      <div id="roomTypeModal" className="form-modal">
        <div className="form-modal-content">
          <span className="close" onClick={closeRoomTypeModal}>&times;</span>
          <form id="myForm">
            {/* Input field for room type name */}
            <label htmlFor="room_type_name">Room Type Name</label><br />
            <input type="text" id="room_type_name" name="room_type_name" onChange={handleChange} /><br />
            {/* Input field for room type price */}
            <label htmlFor="room_type_price">Room Type Price</label><br />
            <input type="number" id="room_type_price" name="room_type_price" onChange={handleChange} /><br />
            {/* Button to add room type */}
            <button className="Plus">
              <img src={Plus} alt="Plus" id="plusImg" onClick={handleRoomTypeSubmit} />
            </button>
          </form>
        </div>
      </div>
      {/* Admin container */}
      <div className='admin-container'>
        {/* Section for room types */}
        <div>
          <h1 className='room_types-title'><center>Room Types</center></h1>
          <div className="rooms_type-container">
          </div>
          {/* Button to display room type modal */}
          <button className="add-room-type-button" onClick={displayRoomTypeModal}><center>Add Room Type</center></button>
        </div>
        {/* Section for rooms */}
        <div>
          <h1 className='rooms-title'><center>Rooms</center></h1>
          <div className="list-container">
          </div>
          {/* Button to display add room modal */}
          <button className="add-room-button" onClick={displayModal}><center>Add Room</center></button>
        </div>
      </div>
    </div > )
    // : <div>{showErrorDialog("Error: ", "You must login as admin or employee to access this page", true, navigate)}</div>);
    };

export default Rooms;