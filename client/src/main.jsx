import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111827',
            color: '#f1f5f9',
            border: '1px solid #1e2d4a',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);
