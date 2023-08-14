import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Router from './Router';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <AuthProvider>
			<RouterProvider router={Router} />
		</AuthProvider>
  </React.StrictMode>,
)
