import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Logic from './Logic.js';
import View from './View.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Logic view={View} />
  </StrictMode>
);
