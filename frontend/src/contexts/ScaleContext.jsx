import { createContext, useContext, useState } from "react";

const ScaleContext = createContext();

export const useScale = () => useContext(ScaleContext);

export const ScaleProvider = ({ children }) => {
  const [selectedScale, setSelectedScale] = useState(null);

  return (
    <ScaleContext.Provider value={{ selectedScale, setSelectedScale }}>
      {children}
    </ScaleContext.Provider>
  );
};


