import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import RegisterContract from './artifacts/Register.json';
import './css/login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alertType, setAlertType] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === '' || password === '') {
      // Apply shake effect to input fields
      const inputFields = document.querySelectorAll('.login-form input');
      inputFields.forEach(input => {
        input.classList.add('shake');
        // Remove shake effect after animation ends
        input.addEventListener('animationend', () => {
          input.classList.remove('shake');
          input.style.borderColor = ''; // Reset border color
        });
      });
    
      return; // Stop further execution
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

      const loggedIn = await registerInstance.methods.loginUser(username, password).call({ from: userAccount });

      if (loggedIn) {
        const role = await registerInstance.methods.getUserRole(userAccount).call({ from: userAccount });
        console.log('User role:', role);

        // Redirect to dashboard based on role
        switch (role) {
          case '1':
            navigate('/manufacturer');
            break;
          case '2':
            navigate('/wholesaler');
            break;
          case '3':
            navigate('/distributor');
            break;
          case '4':
            navigate('/hospital');
            break;
          case '5':
            navigate('/patient');
            break;
          default:
            navigate('/');
            break;
        }
      } else {
        console.error('Incorrect username or password.');
        setAlertType('error');
        setTimeout(() => {
          setAlertType(null);
        }, 3000); // Hide alert after 3 seconds
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setAlertType('error');
      setTimeout(() => {
        setAlertType(null);
      }, 3000); // Hide alert after 3 seconds
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome Back!</h2>
        <h6>Please enter your credentials</h6>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <button type="submit">Login</button>
          <p>New User? <a href="register">Sign Up</a></p>
        </form>
        {alertType && (
          <div className={`alert ${alertType}`}>
            {alertType === 'error' ? (
              <>
                <span className="wrong">&#10008;</span>
                <p>Incorrect username or password. Please try again.</p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
// import React, { useState } from 'react';
// import Web3 from 'web3';
// import RegisterContract from './artifacts/Register.json';
// import {useNavigate} from 'react-router-dom'

// const Login = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loginError, setLoginError] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
//       const accounts = await web3.eth.getAccounts();
//       const userAccount = accounts[0];
//       const networkId = await web3.eth.net.getId();
//       const deployedNetwork = RegisterContract.networks[networkId];
//       const registerInstance = new web3.eth.Contract(
//         RegisterContract.abi,
//         deployedNetwork && deployedNetwork.address
//       );

//       const isValid = await registerInstance.methods.loginUser(username, password).call({ from: userAccount });
//       if (isValid) {
//         // Redirect to dashboard or perform other actions upon successful login
//          navigate ('/manufacturer');
//         console.log('Login successful');
//       } else {
//         setLoginError('Invalid username or password');
//       }
//     } catch (error) {
//       console.error('Error logging in:', error);
//       setLoginError('Error logging in. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       <form onSubmit={handleLogin}>
//         <label>
//           Username:
//           <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
//         </label>
//         <br />
//         <label>
//           Password:
//           <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//         </label>
//         <br />
//         <button type="submit">Login</button>
//       </form>
//       {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
//     </div>
//   );
// };

// export default Login;
