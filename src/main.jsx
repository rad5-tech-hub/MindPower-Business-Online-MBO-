// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { SidebarProvider } from "./context/SidebarContext.jsx";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "./redux/store.js";
import './styles/brand.css';

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    {" "}
    {/* Wrap the app with Redux Provider */}
    <PersistGate loading={null} persistor={persistor}>
      {" "}
      {/* Add PersistGate */}
      <BrowserRouter>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  // </StrictMode>
);
