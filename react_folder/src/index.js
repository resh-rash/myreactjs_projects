import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Project from './project';


// ReactDOM.render(element, document.getElementById("root")); //depreciated from version 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Project/>
    </BrowserRouter>

  </React.StrictMode>
);
