import React, { createContext, useState } from 'react';

export const Context = createContext();

export const Provider = ({ children }) => {
  const [lastRoomClickedID, setLastRoomClickedID] = useState(0);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const changeLastRoomClickedID = (newValue) => {
    setLastRoomClickedID(newValue);
  };

  const changeCheckInDate = (newDate) => {
    setCheckInDate(newDate);
  };

  const changeCheckOutDate = (newDate) => {
    setCheckOutDate(newDate);
  };

  const changePaymentMethod = (newPaymentMethod) => {
    setPaymentMethod(newPaymentMethod)
  }

  return (
    <Context.Provider value={{
      lastRoomClickedID,
      changeLastRoomClickedID,
      checkInDate,
      changeCheckInDate,
      checkOutDate,
      changeCheckOutDate,
      paymentMethod,
      changePaymentMethod
    }}>
      {children}
    </Context.Provider>
  );
};
