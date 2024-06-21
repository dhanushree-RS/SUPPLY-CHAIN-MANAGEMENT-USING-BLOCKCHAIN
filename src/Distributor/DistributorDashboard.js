// import React, { useState, useEffect } from 'react';
// import Web3 from 'web3';
// import SupplyChain from '../artifacts/SupplyChain.json';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const DistributorDashboard = () => {
//   const [web3, setWeb3] = useState(null);
//   const [contractInstance, setContractInstance] = useState(null);
//   const [connectedAccount, setConnectedAccount] = useState('');
//   const [allocatedMedicines, setAllocatedMedicines] = useState([]);

//   useEffect(() => {
//     const initWeb3 = async () => {
//       if (window.ethereum) {
//         try {
//           await window.ethereum.enable();
//           const web3Instance = new Web3(window.ethereum);
//           setWeb3(web3Instance);

//           const networkId = await web3Instance.eth.net.getId();
//           const deployedNetwork = SupplyChain.networks[networkId];
//           const contract = new web3Instance.eth.Contract(
//             SupplyChain.abi,
//             deployedNetwork && deployedNetwork.address
//           );
//           setContractInstance(contract);

//           const accounts = await web3Instance.eth.getAccounts();
//           setConnectedAccount(accounts[0]);
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     };

//     initWeb3();
//   }, []);

//   useEffect(() => {
//     if (contractInstance && connectedAccount) {
//       loadAllocatedMedicines();
//     }
//   }, [contractInstance, connectedAccount]);

//   const loadAllocatedMedicines = async () => {
//     try {
//       const result = await contractInstance.methods.getAllocatedMedicineByDistributor(connectedAccount).call();
//       console.log('Allocated Medicines:', result);
//       setAllocatedMedicines(result);
//     } catch (error) {
//       console.error('Error loading allocated medicines:', error);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h1>Distributor Dashboard</h1>
//       {/* Add navigation and other UI components */}
//       <h3>Allocated Medicines</h3>
//       {Object.keys(allocatedMedicines).length > 0 ? (
//   <div>
//      {allocatedMedicines['ids'].map((id, index) => (
//       <div key={index}>
//         <h2>{allocatedMedicines['names'][index]}</h2>
//         {/* <p><strong>ID:</strong> {id}</p> */}
//         <p><strong>Description:</strong> {allocatedMedicines['descriptions'][index]}</p>
//         <p><strong>Manufacturer Date:</strong> {allocatedMedicines['manufacturerDates'][index]}</p>
//         <p><strong>Expiry Date:</strong> {allocatedMedicines['expiryDates'][index]}</p>
//         <p><strong>Price:</strong> {allocatedMedicines['prices'][index]}</p>
//         <p><strong>IPFS Hash:</strong> {allocatedMedicines['ipfsHashes'][index]}</p>
//         {/* <p><strong>status:</strong> {allocatedMedicines['currentStatuses'][index]}</p> */}
//       </div>
//     ))}
//   </div>
// ) : (
//   <p>No allocated medicines found.</p>
// )}
//     </div>
//   );
// };

//  export default DistributorDashboard;

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from '../artifacts/SupplyChain.json';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for navigation
import 'bootstrap/dist/css/bootstrap.min.css';

const DistributorDashboard = () => {
  // State variables
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [allocatedMedicines, setAllocatedMedicines] = useState({}); // Initialize as an empty object

  // Effect to initialize Web3 and load allocated medicines
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.enable();
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = SupplyChain.networks[networkId];
          const contract = new web3Instance.eth.Contract(
            SupplyChain.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContractInstance(contract);

          const accounts = await web3Instance.eth.getAccounts();
          setConnectedAccount(accounts[0]);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initWeb3();
  }, []);

  // Effect to load allocated medicines
  useEffect(() => {
    if (contractInstance && connectedAccount) {
      loadAllocatedMedicines();
    }
  }, [contractInstance, connectedAccount]);

  // Function to load allocated medicines
  const loadAllocatedMedicines = async () => {
    try {
      const result = await contractInstance.methods.getAllocatedMedicineByAddress(connectedAccount).call();
      console.log('Allocated Medicines:', result);
      setAllocatedMedicines(result || {});
    } catch (error) {
      console.error('Error loading allocated medicines:', error);
    }
  };

  return (
    <div style={{ margin: '50px auto', maxWidth: '800px', textAlign: 'center' }}>
    <nav style={{ backgroundColor: '#333', color: '#fff', padding: '10px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', flexGrow: 1 }}>Pharma Supply Chain</h1>
        <div>
          <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <li style={{ marginRight: '10px' }}>
              <Link to="/qualitycheck" style={{ color: '#fff', textDecoration: 'none' }}>Quality Check</Link>
            </li>
            <li style={{ marginRight: '10px' }}>
              <Link to="/shipmedicine" style={{ color: '#fff', textDecoration: 'none' }}>Ship to Hospitals</Link>
            </li>
            <li style={{ marginRight: '10px' }}>
              <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Logout</Link>
            </li>
          </ul>
         
        </div>
      </div>
    </nav>
  
    <h1 style={{paddingBottom:'20px'}}>Distributor Dashboard</h1>

    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Manufacturer Date</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Expiry Date</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Price</th>
          {/* <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>IPFS Hash</th> */}
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(allocatedMedicines).length > 0 && allocatedMedicines['ids'].map((id, index) => (
          <tr key={index}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{id}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.names[index]}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.descriptions[index]}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.manufacturerDates[index]}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.expiryDates[index]}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.prices[index]}</td>
            {/* <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.ipfsHashes[index]}</td> */}
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.statuses[index]}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {Object.keys(allocatedMedicines).length === 0 && <p>No allocated medicines found.</p>}
  </div>
  
  )};

export default DistributorDashboard;
