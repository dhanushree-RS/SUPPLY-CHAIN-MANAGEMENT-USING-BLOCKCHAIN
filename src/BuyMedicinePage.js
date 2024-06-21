import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from './artifacts/SupplyChain.json';

const BuyMedicinePage = () => {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [wholesalerAddress, setWholesalerAddress] = useState('');
  const [medicineList, setMedicineList] = useState([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        const _web3 = new Web3(window.ethereum);
        setWeb3(_web3);
        try {
          await window.ethereum.enable();
          const networkId = await _web3.eth.net.getId();
          const deployedNetwork = SupplyChain.networks[networkId];
          const contract = new _web3.eth.Contract(
            SupplyChain.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContractInstance(contract);
          const accounts = await _web3.eth.getAccounts();
          console.log(accounts);
          setWholesalerAddress(accounts[0]); 
          
          
        } catch (error) {
          console.error('User denied account access');
        }
      } else {
        console.error('No Ethereum browser detected');
      }
    }
    
    loadWeb3();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      if (contractInstance) {
        try {
          const count = await contractInstance.methods.medicineCount().call();
          const meds = await Promise.all(
            Array.from({ length: count }, (_, i) => i + 1).map(async (id) => {
              const medicine = await contractInstance.methods.medicines(id).call();
              return {
                id: medicine.id,
                name: medicine.name,
                description: medicine.description,
                price: medicine.price,
              };
            })
          );
          setMedicineList(meds);
        } catch (error) {
          console.error('Error fetching medicines:', error);
        }
      }
    };

    fetchMedicines();
  }, [contractInstance]);

  const handleBuyMedicine = async () => {
    try {
      // Assuming selectedMedicineId and amount are already set
      await contractInstance.methods.buyMedicineFromManufacturer(selectedMedicineId).send({ from: wholesalerAddress });
      alert('Medicine bought successfully!');
    } catch (error) {
      console.error('Error buying medicine:', error);
      alert('Failed to buy medicine. Please try again.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <div style={{ backgroundColor: '#f0f0f0', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>Buy Medicine from Manufacturer</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ marginBottom: '10px' }}>Manufacturer Address: {manufacturerAddress}</p>
          {medicineList.map((medicine) => (
            <div key={medicine.id} style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)', padding: '15px', width: '100%', marginBottom: '15px' }}>
              <h3 style={{ marginBottom: '5px' }}>{medicine.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>{medicine.description}</p>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>Price: {medicine.price}</p>
              <button style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer' }} onClick={() => setSelectedMedicineId(medicine.id)}>Buy</button>
            </div>
          ))}
        </div>
        <button style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} onClick={handleBuyMedicine}>Buy Selected Medicine</button>
      </div>
      
    </div>
    
  );
};

export default BuyMedicinePage;
