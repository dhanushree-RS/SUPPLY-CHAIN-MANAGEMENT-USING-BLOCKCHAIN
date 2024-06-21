import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from '../artifacts/SupplyChain.json';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for navigation
import 'bootstrap/dist/css/bootstrap.min.css';

const QualityCheck = () => {
  // State variables
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [allocatedMedicines, setAllocatedMedicines] = useState({});
  const [selectedMedicineIds, setSelectedMedicineIds] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [quality, setQuality] = useState(true); // Default to true, assuming the check passed
  const [loading, setLoading] = useState(false);
  const [qualityCheckResult, setQualityCheckResult] = useState('');
  const [radioDisabled, setRadioDisabled] = useState(false); // Default to false
  const [qualityCheckedMedicines, setQualityCheckedMedicines] = useState({});

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

  // Handler for checkbox change
  const handleCheckboxChange = (event, medicineId) => {
    if (event.target.checked) {
      setSelectedMedicineIds([...selectedMedicineIds, medicineId]);
    } else {
      setSelectedMedicineIds(selectedMedicineIds.filter(id => id !== medicineId));
    }
  };

  // Handler for quality check button click
  const handleQualityCheck = () => {
    setOpenDialog(true);
  };

  // Handler for closing the quality check dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handler for performing quality check
  const performQualityCheck = async () => {
    try {
      setLoading(true);
      // Perform the quality check for selected medicines
      for (const medicineId of selectedMedicineIds) {
        if (qualityCheckedMedicines[medicineId]) {
          console.log(`Medicine ${medicineId} already quality checked.`);
          continue; // Skip quality check if already checked
        }
        const tx = await contractInstance.methods.performQualityCheck(medicineId, quality).send({ from: connectedAccount });
        // Wait for the transaction to be confirmed
       // await tx.wait();

        // Update the status in the state
        const status = quality ? 'Quality Checked' : 'Quality Check Failed';
        setAllocatedMedicines(prevState => ({
          ...prevState,
          [medicineId]: {
            ...prevState[medicineId],
            currentStatus: status
          }
        }));

        // Mark the medicine as quality checked
        setQualityCheckedMedicines(prevState => ({
          ...prevState,
          [medicineId]: true
        }));
      }
      setQualityCheckResult(`Quality check ${quality ? 'passed' : 'failed'} for selected medicines`);

      // Disable the radio buttons after quality check
      setSelectedMedicineIds([]);
      setRadioDisabled(true);

    } catch (error) {
      console.error('Error performing quality check:', error);
      setQualityCheckResult('Error performing quality check');
    } finally {
      setLoading(false);
      setOpenDialog(false); // Close the dialog after quality check
    }
  };

  // Handler for quality change
  const handleQualityChange = (event) => {
    setQuality(event.target.value === 'true'); // Convert string to boolean
  };

  return (
    <div style={{ margin: '50px auto', maxWidth: '800px', textAlign: 'center' }}>
    <nav style={{ backgroundColor: '#333', color: '#fff', padding: '10px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', flexGrow: 1 }}>Pharma Supply Chain</h1>
        <div>
          <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex', justifyContent: 'flex-end' }}>
            {/* <li style={{ marginRight: '10px' }}>
              <Link to="/manageinventory" style={{ color: '#fff', textDecoration: 'none' }}>Manage Inventory</Link>
            </li> */}
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
  
    <h1>Quality Check</h1>
  
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Perform Quality Check</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(allocatedMedicines).length > 0 && allocatedMedicines.ids.map((id, index) => (
          <tr key={index}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{id}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.names[index]}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{allocatedMedicines.statuses[index]}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
              {qualityCheckedMedicines[id] !== undefined ? (
                <input
                  type="radio"
                  checked={selectedMedicineIds.includes(id)}
                  onChange={(event) => handleCheckboxChange(event, id)}
                  disabled={radioDisabled}
                />
              ) : <input
                type="radio"
                checked={selectedMedicineIds.includes(id)}
                onChange={(event) => handleCheckboxChange(event, id)}
              />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  
    <button onClick={handleQualityCheck} disabled={selectedMedicineIds.length === 0} style={{ padding: '8px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>
      Perform Quality Check
    </button>
  
    <div style={{ display: openDialog ? 'block' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', zIndex: '1', left: '0', top: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <div style={{ backgroundColor: '#fefefe', margin: '15% auto', padding: '20px', border: '1px solid #888', width: '50%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ margin: '0' }}>Perform Quality Check</h2>
            <button onClick={handleCloseDialog} style={{ backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Close</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ marginBottom: '10px' }}>
              <input type="radio" name="quality" id="pass" value="true" checked={quality} onChange={handleQualityChange} />
              <label htmlFor="pass" style={{ marginLeft: '5px' }}>Pass</label>
            </div>
            <div>
              <input type="radio" name="quality" id="fail" value="false" checked={!quality} onChange={handleQualityChange} />
              <label htmlFor="fail" style={{ marginLeft: '5px' }}>Fail</label>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={performQualityCheck} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px 20px', textAlign: 'center', textDecoration: 'none', display: 'inline-block', fontSize: '16px', borderRadius: '5px', cursor: 'pointer' }}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  
    <p>{qualityCheckResult}</p>
  </div>
  
  );
};

export default QualityCheck;
