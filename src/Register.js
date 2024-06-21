import React, { useState } from 'react';
import Web3 from 'web3';
import RegisterContract from './artifacts/Register.json';
import './css/register.css';
import { Link } from 'react-router-dom';
import registerImage from './images/register.jpg'; // Import your image here

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [alertType, setAlertType] = useState(null);
  const [shakeFields, setShakeFields] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if any required field is missing
    if (!name || !username || !role || !companyName || !licenseNumber || !password) {
      setShakeFields(true);
      return;
    }

    try {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
      const accounts = await web3.eth.getAccounts();
      const userAccount = accounts[0];
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = RegisterContract.networks[networkId];
      const registerInstance = new web3.eth.Contract(
        RegisterContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      await registerInstance.methods.registerUser(userAccount, name, username, role, companyName, licenseNumber, password).send({ from: userAccount });

      setName('');
      setUsername('');
      setRole('');
      setCompanyName('');
      setLicenseNumber('');
      setPassword('');
      setAlertType('success');
    } catch (error) {
      console.error('Error registering user:', error);
      setAlertType('error');
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-image">
          <img src={registerImage} alt="Register" />
        </div>
        <div className="register-form">
          
          <form onSubmit={handleRegister}>
          <h2>Register</h2>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={shakeFields && !name ? 'shake' : ''} />
          <br />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className={shakeFields && !username ? 'shake' : ''} />
          <br />
          <select value={role} onChange={(e) => setRole(e.target.value)} className={shakeFields && !role ? 'shake' : ''}>
            <option value="">Select Role</option>
            <option value="1">Manufacturer</option>
            <option value="2">Wholesaler</option>
            <option value="3">Distributor</option>
            <option value="4">Hospital</option>
            <option value="5">Patient</option>
          </select>
          <br />
          <div className="half-width">
            <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={shakeFields && !companyName ? 'shake' : ''} />
          </div>
          <div className="half-width">
            <input type="text" placeholder="License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className={shakeFields && !licenseNumber ? 'shake' : ''} />
          </div>
          <br />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={shakeFields && !password ? 'shake' : ''} />
          <br />
          <button type="submit">Register</button>
          <p>Already registered? <Link to="/login">Sign In</Link></p>
        </form>
        {alertType && (
          <div className={`alert ${alertType}`}>
            {alertType === 'success' ? (
              <>
                <span className="tick">&#10004;</span>
                <p>Registration successful!</p>
              </>
            ) : (
              <>
                <span className="wrong">&#10008;</span>
                <p>Registration unsuccessful. Please try again.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
    
  );
};

export default Register;
