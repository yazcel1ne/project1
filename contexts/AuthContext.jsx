import { createContext, useContext, useState, useEffect } from "react";
import api from "../config/api";

const AuthContent = createContext({
  user: null,
  setUser: () => {},
  csrfToken: () => {},
  mode: () => {"myLighttheme"}
});

export const AuthProvider = ({ children }) => {
  const [user, _setUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );

  // set user to local storage
  const setUser = (user) => {
    if (user) {
      const hideUser = {... user}
   
        for (const key in hideUser) {
      if (hideUser.hasOwnProperty(key) && hideUser[key]) {
        hideUser[key] = [];
      }
    }

      sessionStorage.setItem("user", JSON.stringify(hideUser));
    } else {
      sessionStorage.removeItem("user");
    }
    _setUser(user);
  };

  // csrf token generation for guest methods
  const csrfToken = async () => {
    await api.get("/sanctum/csrf-cookie");
    return true;
  };

  return (
    <AuthContent.Provider value={{ user, setUser, csrfToken }}>
      {children}
    </AuthContent.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContent);
};
