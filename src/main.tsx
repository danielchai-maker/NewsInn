import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { BookmarkProvider } from "./context/BookmarkContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <BookmarkProvider>
            <App />
          </BookmarkProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
