import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element with id='root'");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- Start the container here */}
        <App />        {/* <-- Place App INSIDE it */}
      </AuthProvider>   {/* <-- End the container here */}
    </BrowserRouter>
  </React.StrictMode>
);