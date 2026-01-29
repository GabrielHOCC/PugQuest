import React, { useEffect } from 'react';

const Auth: React.FC = () => {
  useEffect(() => {
    // Redireciona para a landing para abrir o modal lá
    window.location.hash = '#/';
  }, []);

  return null;
};

export default Auth;