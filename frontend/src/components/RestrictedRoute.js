import { Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from "react";

// Higher-order component for role-based access control
const RestrictedRoute = ({ element: Component, roles, ...rest }) => {
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const response = await fetch('/api/getAllUser', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.find(user => user.email === localStorage.getItem('email'));
            setUserRoles(user.roles);
          } else {
            // Handle error when fetching user roles
            console.error('Failed to fetch user roles');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserRoles();
  }, []);

  const isAllowed = roles.some(role => userRoles.includes(role));

  return (
    <Route
      {...rest}
      element={isAllowed ? <Component /> : <Navigate to="/access-denied" replace />}
    />
  );
};

export default RestrictedRoute;
