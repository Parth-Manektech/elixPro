import React, { Suspense } from 'react';

// import Component
import Loader from './Components/Loader';
import AllRoutes from './Routes/index'

//import stylesheet 
import './Assets/styles/main.scss'

import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer } from 'react-toastify';





function App() {
  return (
    <div className="App">
      <Suspense fallback={<Loader />}>
        <AllRoutes />
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;
