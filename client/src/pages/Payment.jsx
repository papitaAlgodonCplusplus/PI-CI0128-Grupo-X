/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useEffect, useRef } from 'react'
import '../styles.scss';
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Context } from '../Context';
import { AuthContext } from '../AuthContext.js';
import { showErrorDialog, showSuccessDialog, calculateNumberOfDays } from "../Misc.js";

const Payment = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('credit-card');
  const [servicesList, setServicesList] = useState([]);
  const { checkInDate } = useContext(Context);
  const { checkOutDate } = useContext(Context);
  const { lastRoomClickedID } = useContext(Context);
  const { userId } = useContext(AuthContext);
  const { changePaymentMethod } = useContext(Context);
  const [services, setServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedService, setServiceOption] = useState('');
  const [cardType, setCardType] = useState('');

  // Define an asynchronous function to fetch data
  const fetchAndSetData = async () => {
    try {
      // Fetch services data
      axios.get('/services').then(response => {
        // Set the services state with the fetched data
        setServices(response.data);
        // Set the default service option
        setServiceOption(response.data[0].service_name);
      });

      // Fetch room details by room ID
      const roomResponse = await axios.get(`/rooms/by_roomID${lastRoomClickedID}`);
      // Fetch room type details by room type ID
      const roomTypeResponse = await axios.get(`/rooms/room_type_ByID${roomResponse.data[0].type_of_room}`);

      // Calculate total price based on room type price and number of days
      setTotalPrice(roomTypeResponse.data[0].price * calculateNumberOfDays(checkInDate, checkOutDate));
    } catch (error) {
      showErrorDialog("An error occurred:", error, false, navigate);
    }
  };


  useEffect(() => {
    fetchAndSetData();
  }, []);

  const handleExpirationChange = async event => {
    // Extract the input value (card expiration month / year)
    let inputValue = event.target.value;

    // Ensure input is at least 3 characters long
    if (inputValue.length <= 3) {
      return;
    }

    // Remove non-digit characters from the input
    inputValue = inputValue.replace(/\D/g, '');

    // Validate and format the input
    if (inputValue.length > 0) {
      // Extract month and year from the input
      let [month, year] = inputValue.match(/(\d{1,2})(\d{0,2})/).slice(1, 3);

      // Convert month and year to integers
      month = parseInt(month, 10);
      year = parseInt(year, 10);

      // Validate month and year
      if (month > 12 || month < 1 || year < new Date().getFullYear() - 2000) {
        showErrorDialog('Invalid expiration date', "Make sure the month and the date are correct.", false, navigate);
        // Clear input field
        event.target.value = ``;
        return;
      }

      // Update input field with formatted month/year
      event.target.value = `${month}/${year}`;
    }
  };

  // Function to handle the addition of a new service to the services list
  const handleAddService = (event) => {
    // Check if the services list already includes the selected service option
    if (servicesList.includes(selectedService)) {
      // If the service option already exists, show an error dialog
      showErrorDialog("Error: ", "Service option already exists in the list.", false, navigate);
    } else {
      // If the service option doesn't exist, add it to the services list
      setServicesList(previousList => [...previousList, selectedService]);

      // Fetch the price of the selected service from the backend
      axios.get(`services/get_service${selectedService}`)
        .then(response => {
          // Extract the service price from the response data
          const servicePrice = response.data[0].service_price;
          // Update the total price by adding the service price
          setTotalPrice(previousTotalPrice => previousTotalPrice + servicePrice);
        })
        .catch(error => {
          // If there's an error fetching the service price, show an error dialog
          showErrorDialog('Error fetching service price:', error, false, navigate);
        });
    }
  }

  const handleServiceChange = (e) => {
    setServiceOption(e.target.value);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    changePaymentMethod(e.target.value);
  };

  const handleCardNumber = (e) => {
    let numericValue = e.target.value
    if (/\D/.test(e.target.value)) {
      numericValue = e.target.value.replace(/\D/g, '');
      e.target.value = numericValue;
    }

    let newCardType = '';
    if (/^4/.test(numericValue)) {
      newCardType = 'Visa';
    } else if (/^5[1-5]/.test(numericValue)) {
      newCardType = 'Mastercard';
    } else if (/^3[47]/.test(numericValue)) {
      newCardType = 'American Express';
    }
    setCardType(newCardType)
  }

  const bankNameRef = useRef(null);
  const cashNameRef = useRef(null);

  const handlePay = async e => {
    e.preventDefault();
    let paymentId = 0;
    let paymentEndpoint = '';
    let paymentData = {};

    switch (selectedOption) {
      case 'credit-card':
        // For credit card payment
        paymentEndpoint = '/payments/add_card_payment'; // Set endpoint for adding card payment
        paymentData = { price: totalPrice, paymentMethodId: 1, cardType }; // Set payment data for credit card
        break;
      case 'bank-transaction':
        // For bank transaction payment
        paymentEndpoint = '/payments/add_bank_payment'; // Set endpoint for adding bank payment
        paymentData = { price: totalPrice, paymentMethodId: 2, bankName: bankNameRef.current.value }; // Set payment data for bank transaction
        break;
      case 'cash':
        // For cash payment
        paymentEndpoint = '/payments/add_cash_payment'; // Set endpoint for adding cash payment
        const change = cashNameRef.current.value - totalPrice; // Calculate change
        paymentData = { price: totalPrice, paymentMethodId: 3, change }; // Set payment data for cash
        break;
      default:
        break;
    }

    // If payment endpoint is determined
    if (paymentEndpoint !== '') {
      // Make a POST request to the determined payment endpoint with payment data
      await axios.post(paymentEndpoint, paymentData);
      // Make a POST request to add payment with payment data
      const paymentRes = await axios.post('/payments/add_payment', paymentData);
      // Update payment ID with the received payment ID
      paymentId = paymentRes.data.paymentId;
    }

    const reservationRequestData = {
      check_in_date: checkInDate,           // Date of check-in
      check_out_date: checkOutDate,         // Date of check-out
      room_id: lastRoomClickedID,           // ID of the room selected
      payment_id: paymentId,                 // ID of the payment method
      user_id: userId                       // ID of the user making the reservation
    };

    // Making a POST request to add reservation
    const reservationResponse = await axios.post("/reservations/add_reservation", reservationRequestData);

    try {
      let counter = 0;  // Counter to keep track of the number of services processed
      // Iterating through each service asynchronously
      services.map(async (service) => {
        // Fetching service details
        const serviceResponse = await axios.get(`/services/get_service/${service.service_name}`);
        const serviceId = serviceResponse.data[0].service_id; // Extracting service ID from the response
        // Making a POST request to add service to service log
        await axios.post(`/services/add_to_service_log`, { service_id: serviceId, reservation_id: reservationResponse.data.insertId });
        counter++;
        // Checking if all services have been processed
        if (counter === services.length) {
          return Promise.resolve(); // Resolving the promise once all services are processed
        }
      });
    } catch (error) {
      showErrorDialog("Error occurred:", error, false, navigate);
    }
    showSuccessDialog("Payment Approved!", "You'll receive an email with your reservation details soon.", navigate);
  };

  const renderForm = () => {
    switch (selectedOption) {
      case 'credit-card':
        return <CreditCardForm />;
      case 'bank-transaction':
        return <BankTransactionForm />;
      case 'cash':
        return <CashForm />;
      default:
        return null;
    }
  };

  return (
    // Main container with body class
    <div className='body'>
      {/* Form for payment method selection */}
      <form className='payment-method-selection'>
        {/* Radio button for credit card payment */}
        <label className='payment-method-selection-content'>
          <input
            type="radio"
            value="credit-card"
            checked={selectedOption === 'credit-card'} // Checking if credit card is selected
            onChange={handleOptionChange} // Handling change event for credit card selection
            className='payment-method-selection-content'
          />
          Credit Card
        </label>
        {/* Radio button for bank transaction payment */}
        <label className='payment-method-selection-content'>
          <input
            type="radio"
            value="bank-transaction"
            checked={selectedOption === 'bank-transaction'} // Checking if bank transaction is selected
            onChange={handleOptionChange} // Handling change event for bank transaction selection
            className='payment-method-selection-content'
          />
          Bank Transaction
        </label>
        {/* Radio button for cash payment */}
        <label className='payment-method-selection-content'>
          <input
            type="radio"
            value="cash"
            checked={selectedOption === 'cash'} // Checking if cash is selected
            onChange={handleOptionChange} // Handling change event for cash selection
            className='payment-method-selection-content'
          />
          Cash
        </label>
      </form>
      {/* Display total price */}
      <h1><center>{totalPrice}</center></h1>
      {/* Render payment form based on selected option */}
      {renderForm()}
    </div>
  );

  // Component for Credit Card payment form
  function CreditCardForm() {
    return (
      <div className="card-form">
        {/* Form for credit card details */}
        <form action="#">
          {/* Input field for card number */}
          <div className="card-form-group">
            <label htmlFor="cardnumber">Card Number</label>
            <input type="text" onInput={handleCardNumber} maxLength="19" id="cardnumber" className="cardnumber" required />
          </div>
          {/* Input field for cardholder name */}
          <div className="card-form-group">
            <label htmlFor="cardholder">Card Holder Name</label>
            <input type="text" id="cardholder" className="cardholder" required />
          </div>
          {/* Input field for expiration date */}
          <div className="card-form-group">
            <label htmlFor="expiration">Expiration Date</label>
            <input type="text" id="expiration" className="expiration" onChange={handleExpirationChange} placeholder="MM/YY" required />
          </div>
          {/* Input field for PIN */}
          <div className="card-form-group">
            <label htmlFor="pin">PIN</label>
            <input type="password" id="pin" className="pin" maxLength="4" required />
          </div>
          {/* Dropdown for selecting services */}
          <select name="services_selector" className="services_selector" id="services_selector_1"
            onChange={handleServiceChange} value={selectedOption} required>
            {/* Mapping services to options */}
            {services.map(service => (
              <option key={service.serviceid} value={service.service_name}>{service.service_name}</option>
            ))}
          </select>
          {/* Button to add service */}
          <button className="add-service-button" onClick={handleAddService}><center>Add Amenity</center></button>
          {/* Button to confirm payment */}
          <button className="pay-button" onClick={handlePay}><center>Confirm Payment</center></button>
        </form>
      </div>
    );
  }

  // Component for Bank Transaction payment form
  function BankTransactionForm() {
    return (
      <div className="bank-form">
        {/* Form for bank transaction details */}
        <form action="#">
          {/* Input field for account holder name */}
          <div className="bank-form-group">
            <label htmlFor="accountHolder">Account Holder Name</label>
            <input type="text" id="accountHolder" className="accountHolder" required />
          </div>
          {/* Input field for account number */}
          <div className="bank-form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input type="text" id="accountNumber" className="accountNumber" required />
          </div>
          {/* Input field for bank name */}
          <div className="bank-form-group">
            <label htmlFor="bank_name">Bank Name</label>
            <input type="text" id="bank_name" className="bank_name" ref={bankNameRef} required />
          </div>
          {/* Textarea for transaction description */}
          <div className="bank-form-group">
            <label htmlFor="description">Transaction Description</label>
            <textarea id="description" className="description" rows="4" required></textarea>
          </div>
          {/* Dropdown for selecting services */}
          <select name="services_selector" className="services_selector" id="services_selector_1"
            onChange={handleServiceChange} value={selectedOption} required>
            {/* Mapping services to options */}
            {services.map(service => (
              <option key={service.serviceid} value={service.service_name}>{service.service_name}</option>
            ))}
          </select>
          {/* Button to add service */}
          <button className="add-service-button" onClick={handleAddService}><center>Add Amenity</center></button>
          {/* Button to confirm payment */}
          <button className="pay-button" onClick={handlePay}><center>Confirm Payment</center></button>
        </form>
      </div>
    );
  }

  // Component for Cash payment form
  function CashForm() {
    return (
      <div className="cash-form">
        {/* Form for cash payment details */}
        <form action="#">
          {/* Dropdown for selecting badge type */}
          <div className="cash-form-group">
            <label htmlFor="badge">Badge Type</label>
            <select name="badge" className="badge" id="badge" required>
              {/* Options for badge type */}
              <option value="colones">Colones</option>
              <option value="dolares">Dollars</option>
              <option value="euros">Euros</option>
              <option value="otro">Other</option>
            </select>
            {/* Input field for cash amount */}
            <label htmlFor="cash-amount">Amount</label>
            <input type="number" id="cash-amount" className="cash-amount" ref={cashNameRef} required />
          </div>
          {/* Dropdown for selecting services */}
          <select name="services_selector" className="services_selector" id="services_selector_1"
            onChange={handleServiceChange} value={selectedOption} required>
            {/* Mapping services to options */}
            {services.map(service => (
              <option key={service.serviceid} value={service.service_name}>{service.service_name}</option>
            ))}
          </select>
          {/* Button to add service */}
          <button className="add-service-button" onClick={handleAddService}><center>Add Amenity</center></button>
          {/* Button to confirm payment */}
          <button className="pay-button" onClick={handlePay}><center>Confirm Payment</center></button>
        </form>
      </div>
    );
  }
};

export default Payment;