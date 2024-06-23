import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthUserContext';
import ProtectedRoute from './Components/RoutingProtection/ProtectedRoute';
import UnProtectedRoute from './Components/RoutingProtection/UnProtectedRoute';
import LoginPage from './Components/login';

function App() {
  const router=createBrowserRouter(
    [
      {
        path:'/',
        element:(
          <UnProtectedRoute>
            <h1>This is Intro Page</h1>
          </UnProtectedRoute>
        )
      },
      {
        path:'/signup&in',
        element:(
          <UnProtectedRoute>
            <LoginPage/>
          </UnProtectedRoute>
        )
      },
      // Example of a Protected Route
      {
        path:'/in',
        element:(
          <ProtectedRoute>
            <h1>This is homepage</h1>
          </ProtectedRoute>
        )
      }
    ]
  )
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );


  
}

export default App;
