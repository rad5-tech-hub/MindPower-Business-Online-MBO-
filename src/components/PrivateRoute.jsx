import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../redux/authSlice";
import { persistor } from "../redux/store";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(selectAuth);
  const [isRehydrated, setIsRehydrated] = useState(false);

  // Wait for redux-persist to rehydrate
  useEffect(() => {
    const unsubscribe = persistor.subscribe(() => {
      const { bootstrapped } = persistor.getState();
      if (bootstrapped) {
        setIsRehydrated(true);
        unsubscribe();
      }
    });

    // Check if already bootstrapped
    if (persistor.getState().bootstrapped) {
      setIsRehydrated(true);
      unsubscribe();
    }

    return () => unsubscribe();
  }, []);

  console.log(
    "🔍 PrivateRoute Check - isRehydrated:",
    isRehydrated,
    "isAuthenticated:",
    isAuthenticated
  );

  // Show loading state while rehydrating
  if (!isRehydrated) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FEFEFF]">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-200"></div>
          <div className="w-3 h-3 bg-[#003087] rounded-full animate-bounce delay-400"></div>
        </div>
      </div>
    );
  }

  // After rehydration, check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
