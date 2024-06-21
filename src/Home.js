import React from "react";
import { Link } from "react-router-dom";
import vdo from './images/tachyon.mp4'; // Assuming this is the correct path to your video
import './css/home.css';

const Home = () =>  {
  return (
    <div>
      <nav className="navbar navbar-expand-lg" style={{ position: 'fixed', width: '100%', zIndex: '1', backgroundColor:'#5072A7', transition: 'background-color 0.3s ease', animation: 'slideInDown 0.5s ease' }}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/" style={{ color: '#fff' }}>PHARMA SUPPLY CHAIN</Link>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">Register</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="image-container" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: -1 }}>
        <video 
          autoPlay 
          loop 
          muted 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity:0.85
          }}
        >
          <source src={vdo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Your other content goes here */}
      </div>
    </div>
  );
}

export default Home;
