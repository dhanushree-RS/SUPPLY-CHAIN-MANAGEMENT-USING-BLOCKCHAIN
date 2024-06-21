import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainContract from '../artifacts/SupplyChain.json';

const SellMedicine = () => {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [message, setMessage] = useState('');
  
    useEffect(() => {
      const loadWeb3 = async () => {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          try {
            await window.ethereum.enable();
            setWeb3(web3Instance);
            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);
            const networkId = await web3Instance.eth.net.getId();
            const deployedNetwork = SupplyChainContract.networks[networkId];
            const supplyChainContract = new web3Instance.eth.Contract(
              SupplyChainContract.abi,
              deployedNetwork && deployedNetwork.address,
            );
            setContract(supplyChainContract);
          } catch (error) {
            console.error('Error connecting to Web3:', error);
          }
        } else {
          console.error('Web3 not found. Please install MetaMask.');
        }
      };
      loadWeb3();
    }, []);
  
    useEffect(() => {
      const loadMedicines = async () => {
        try {
          const count = await contract.methods.medicineCount().call();
          const medicineList = [];
          for (let i = 1; i <= count; i++) {
            const medicine = await contract.methods.getMedicineById(i).call();
            medicineList.push(medicine);
          }
          setMedicines(medicineList);
        } catch (error) {
          console.error('Error loading medicines:', error);
        }
      };
      if (contract) {
        loadMedicines();
      }
    }, [contract]);
  
    const handleSellMedicine = async () => {
      if (!selectedMedicine) {
        setMessage('Please select a medicine');
        return;
      }
      try {
        await contract.methods.sellMedicine(selectedMedicine.id).send({ from: account, value: web3.utils.toWei('5', 'ether') });
        setMessage('Medicine sold successfully!');
      } catch (error) {
        setMessage('Error selling medicine: ' + error.message);
      }
    };
  
    return (
      <div>
        <h2>Sell Medicine</h2>
        <p>Select a medicine to sell:</p>
        <select onChange={(e) => setSelectedMedicine(JSON.parse(e.target.value))}>
          <option value="">Select Medicine</option>
          {medicines.map((medicine) => (
            <option key={medicine.id} value={JSON.stringify(medicine)}>
              {medicine.name} - {medicine.id}
            </option>
          ))}
        </select>
        <button onClick={handleSellMedicine}>Sell Medicine</button>
        <p>{message}</p>
        {selectedMedicine && (
          <div>
            <h3>Selected Medicine Details:</h3>
            <p>ID: {selectedMedicine.id}</p>
            <p>Name: {selectedMedicine.name}</p>
            <p>Composition: {selectedMedicine.composition}</p>
            <p>Description: {selectedMedicine.description}</p>
            <p>Manufacturer Date: {selectedMedicine.manufacturerDate}</p>
            <p>Expiry Date: {selectedMedicine.expiryDate}</p>
            <p>Price: {web3.utils.fromWei(selectedMedicine.price.toString(), 'ether')} ETH</p>
            <p>Current Status: {selectedMedicine.currentStatus}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default SellMedicine;