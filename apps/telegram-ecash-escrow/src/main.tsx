import { createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { routeTree } from './routeTree.gen';


const rootElement = document.getElementById('root')!;

// Create a new router instance

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
