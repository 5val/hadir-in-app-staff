import React, { createContext, useContext, useState } from "react";

// Tipe data untuk lokasi kantor
type OfficeLocation = {
  lat: string;
  lng: string;
  radius: string;
};

type OfficeContextType = {
  officeLocation: OfficeLocation;
  setOfficeLocation: (loc: OfficeLocation) => void;
};

const OfficeContext = createContext<OfficeContextType | undefined>(undefined);

export function OfficeProvider({ children }: { children: React.ReactNode }) {
  const [officeLocation, setOfficeLocation] = useState<OfficeLocation>({
    lat: "-7.291547",
    lng: "112.759209",
    radius: "100",
  });

  return (
    <OfficeContext.Provider value={{ officeLocation, setOfficeLocation }}>
      {children}
    </OfficeContext.Provider>
  );
}

// Hook kustom agar mudah digunakan di file lain
export function useOffice() {
  const context = useContext(OfficeContext);
  if (!context) throw new Error("useOffice must be used within OfficeProvider");
  return context;
}
