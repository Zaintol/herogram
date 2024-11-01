import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

import App from './app/app';
// Set default base URL for axios
axios.defaults.baseURL = process.env.NX_PUBLIC_API_URL;

console.log("process.env.NX_PUBLIC_API_URL");
console.log(process.env.NX_PUBLIC_API_URL);
console.log(process.env);

// Set default auth header if token exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);
