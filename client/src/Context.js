import React, { createContext, useState } from 'react';

export const Context = createContext();

export const Provider = ({ children }) => {
  const [lastRoomClickedID, setLastRoomClickedID] = useState(0);

  const changeLastRoomClickedID = (newValue) => {
    setLastRoomClickedID(newValue);
  };
  
  return (
    <Context.Provider value={{ lastRoomClickedID, changeLastRoomClickedID }}>
      {children}
    </Context.Provider>
  );
};
