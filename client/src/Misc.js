import axios from "axios"

export function emptyContainer(container) {
  container.innerHTML = '';
}

export function updateContainer(container) {
  container.style.gridAutoRows = 'auto';
  container.style.gridAutoFlow = 'dense';
}


export async function deleteDataWithTimeout(url, timeout) {
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

export async function postDataWithTimeout(url, data, timeout) {
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


export function showErrorDialog(title, description, exit_on_close = false, navigate = null) {
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
    if (exit_on_close) {
      navigate("/login");
    }
  });

  dialog.appendChild(titleElement);
  dialog.appendChild(descriptionElement);
  dialog.appendChild(closeButton);

  overlay.appendChild(dialog);

  document.body.appendChild(overlay);
}

export function calculateNumberOfDays(checkInDate, checkOutDate) {
  const checkInTime = new Date(checkInDate).getTime();
  const checkOutTime = new Date(checkOutDate).getTime();
  const differenceInMs = checkOutTime - checkInTime;
  const daysDifference = Math.ceil(differenceInMs / (1000 * 3600 * 24));
  return daysDifference;
}

export function showSuccessDialog(title, description, navigate) {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');

  const dialog = document.createElement('div');
  dialog.classList.add('success-modal-dialog');

  const titleElement = document.createElement('div');
  titleElement.classList.add('modal-title');
  titleElement.textContent = title;

  const descriptionElement = document.createElement('div');
  descriptionElement.classList.add('modal-description');
  descriptionElement.textContent = description;
  console.log(description)

  const closeButton = document.createElement('button');
  closeButton.classList.add('success-modal-close');
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
    navigate("/home")
  });

  dialog.appendChild(titleElement);
  dialog.appendChild(descriptionElement);
  dialog.appendChild(closeButton);

  overlay.appendChild(dialog);

  document.body.appendChild(overlay);
}
