import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthRedirect = ({ path, element }) => {
  const { user } = useSelector((state) => state.auth);

  return user ? <Navigate to={path} replace /> : element;
};

export default AuthRedirect;
