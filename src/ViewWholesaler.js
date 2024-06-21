import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import RegisterContract from './artifacts/Register.json';

const ViewWholesaler = () => {
    const [wholesalers, setWholesalers] = useState([]);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (window.ethereum) {
                window.web3 = new Web3(window.ethereum);
                await window.ethereum.enable();
            } else if (window.web3) {
                window.web3 = new Web3(window.web3.currentProvider);
            } else {
                window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
            const web3 = window.web3;
            const networkId = await web3.eth.net.getId();
            const contractData = RegisterContract.networks[networkId];
            if (!contractData) {
                window.alert('Contract not deployed to detected network.');
                return;
            }
            const contract = new web3.eth.Contract(RegisterContract.abi, contractData.address);


            const response = await contract.methods.viewUsers().call();
              console.log("Response:", response);

            const users = response[0];
            const roles = response[3];
            const names = response[1];
            const companyName = response[4];
            const licenseNumber = response[5];

            const registeredWholesalers = [];
            for (let i = 0; i < users.length; i++) {
                if (roles[i] === '2') {
                    registeredWholesalers.push({ address: users[i], name: names[i], companyname: companyName[i], license:licenseNumber[i]});
                }
            }
            setWholesalers(registeredWholesalers);
            console.log("Registered Wholesalers:", registeredWholesalers);
        };


        loadBlockchainData();
    }, []);

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Registered Wholesalers</h1>
            <div style={{ display: 'inline-block', textAlign: 'left' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead style={{ backgroundColor: '#f2f2f2' }}>
                        <tr>
                            <th style={{ border: '1px solid #000000', padding: '8px' }}>Name</th>
                            <th style={{ border: '1px solid #000000', padding: '8px' }}>Address</th>
                            <th style={{ border: '1px solid #000000', padding: '8px' }}>Company Name</th>
                            <th style={{ border: '1px solid #000000', padding: '8px' }}>License Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wholesalers.map((wholesaler, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #000000', padding: '8px' }}>{wholesaler.name}</td>
                                <td style={{ border: '1px solid #000000', padding: '8px' }}>{wholesaler.address}</td>
                                <td style={{ border: '1px solid #000000', padding: '8px' }}>{wholesaler.companyname}</td>
                                <td style={{ border: '1px solid #000000', padding: '8px' }}>{wholesaler.license}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewWholesaler;
