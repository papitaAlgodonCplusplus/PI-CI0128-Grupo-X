import React, { useState, useEffect } from 'react'
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
  })

  const addCard = (title, description, filename, id) => {
    description = description.substring(0, 90);
    const cardsContainer = document.querySelector('.list-container');

    const newCardHTML = `
    <div class="list-item">
      <img src="${filename}" alt="${filename}"/>
      <div>
        <h3>${title}</h3>
        <p>${description}</p>
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


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/rooms");
        const filenames = await axios.get(`/files/retrieve_images`);
        console.log(filenames.data)
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
  });

  const handleDelete = async (e, id) => {
    e.preventDefault()
    try {
      await axios.delete(`/rooms/delete${id}`);
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
    try {
      const res = await axios.get("/rooms");
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
        console.log("Added Card", i)
        i++;
      });
      updateCardsContainer();
      return;
    } catch (error) {
      showErrorDialog("An error occurred:", error);
    }
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

      console.log("Uploaded")

      const res_add = await postDataWithTimeout("/rooms/add_room", inputs, 500);
      console.log("Rooms added successfully", res_add);

      const res = await axios.get("/rooms");
      const filenames = await axios.get(`/files/retrieve_images`);
      var i = 0;
      emptyCardContainer();
      res.data.forEach(room => {
        if (i >= filenames.data.length) {
          updateCardsContainer();
          window.location.reload();
          return;
        }
        const filepath = "/upload/" + filenames.data[i].filename;
        addCard(room.title, room.description, filepath, room.roomid);
        console.log("Added Card", i)
        i++;
      });
      updateCardsContainer();
      console.log("Cards updated successfully");
      window.location.reload();
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

  return (
    <div>
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
            <button className="Plus">
              <img src={Plus} alt="Plus" id="plusImg" onClick={handleSubmit} />
            </button>
          </form>
        </div>
      </div>
      <div className='admin-container'>
        <div>
          <h1 className='reservations-title'><center>Reservations</center></h1>
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