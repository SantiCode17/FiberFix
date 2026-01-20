import React, { createContext, useContext, useState } from 'react';

// Crear el contexto con tipos definidos
interface UserContextType {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar el contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};