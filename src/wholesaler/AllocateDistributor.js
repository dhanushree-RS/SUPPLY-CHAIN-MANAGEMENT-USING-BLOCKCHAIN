import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChain from '../artifacts/SupplyChain.json';
import { create } from 'ipfs-http-client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const AllocateDistributor = () => {
  const [web3, setWeb3] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [wholesalerAddress, setWholesalerAddress] = useState('');
  const [medicineId, setMedicineId] = useState('');
  const [distributorAddress, setDistributorAddress] = useState('');
  const [distributorName, setDistributorName] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');

  const ipfs = create({
    host: 'localhost',
    port: 5001,
    protocol: 'http',
  });

  const handleAllocateDistributor = async (e) => {
    e.preventDefault();
    try {
      if (!wholesalerAddress || !medicineId || !distributorAddress) {
        console.error('All fields are required');
        return;
      }
      const currentDate = new Date().toLocaleString(); // Get current date and time
  
      // Get medicine details from the contract
      const medicineDetails = await contractInstance.methods.medicines(medicineId).call();
  
      // Construct tax invoice data
      const taxInvoiceData = {
        Wholesaleraddress: wholesalerAddress, // Manufacturer's address
        currentDate: currentDate, // Current date and time
        medicineId: medicineId,
        prefix: medicineDetails.prefix,
        name: medicineDetails.name,
        description: medicineDetails.description,
        manufacturerDate: medicineDetails.manufacturerDate,
        expiryDate: medicineDetails.expiryDate,
        price: medicineDetails.price,
        composition: medicineDetails.composition,
        DistributorAddress: distributorAddress,
        DistributorName: distributorName,
      };
  
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      // Draw company name "BAYER MANUFACTURING LTD" at the top center
      page.drawText('BAYER MANUFACTURING LTD', {
        x: width / 2 - 100, // Adjust as needed for center alignment
        y: height - 50,
        size: 18,
        font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
        color: rgb(0, 0, 0),
        lineHeight: 24,
      });
      
      // Add current date on the top right
      const date = new Date().toLocaleDateString();
      page.drawText(`Date: ${date}`, {
        x: width - 200, // Adjust as needed for right alignment
        y: height - 80,
        size: 12,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
        color: rgb(0, 0, 0),
      });
      
      // Add current time on the top right below the date
      const time = new Date().toLocaleTimeString();
      page.drawText(`Time: ${time}`, {
        x: width - 200, // Adjust as needed for right alignment
        y: height - 70, // Adjust the y-coordinate to place below the date
        size: 12,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
        color: rgb(0, 0, 0),
      });
      
      // Add tax invoice data
      let yOffset = height - 100;
      for (const [key, value] of Object.entries(taxInvoiceData)) {
        if (key === 'medicineDetails') {
          // Print medicine details separately
          const medicineDetailsString = JSON.stringify(value);
          page.drawText(`${key}: ${medicineDetailsString}`, {
            x: 50,
            y: yOffset,
            size: 15,
            font: await pdfDoc.embedFont(StandardFonts.Helvetica),
            color: rgb(0, 0, 0),
          });
        } else {
          // Print other data normally
          page.drawText(`${key}: ${value}`, {
            x: 50,
            y: yOffset,
            size: 15,
            font: await pdfDoc.embedFont(StandardFonts.Helvetica),
            color: rgb(0, 0, 0),
          });
        }
        yOffset -= 20;
      }
      
      // Serialize PDF
      const pdfBytes = await pdfDoc.save();
      
      // Upload PDF to IPFS
      const ipfsResult = await ipfs.add(pdfBytes);
      const taxInvoiceIpfsHash = ipfsResult.path;
      console.log('Tax Invoice PDF IPFS Hash:', taxInvoiceIpfsHash);
      setIpfsHash(taxInvoiceIpfsHash);
     
      const medicineIdBN = web3.utils.toBN(medicineId);
      await contractInstance.methods
        .allocateDistributor(medicineIdBN, distributorAddress, taxInvoiceIpfsHash)
        .send({ from: wholesalerAddress });
      console.log('Distributor allocated successfully');
      // Clear form fields
      setMedicineId('');
      setDistributorAddress('');
    } catch (error) {
      console.error('Error allocating distributor:', error);
    }
  };

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
        setWholesalerAddress(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (!web3) {
      initWeb3();
    }
  }, [web3]);

  return (
    <div>
    <nav style={{ backgroundColor: '#333', color: '#fff', padding: '15px 30px', marginBottom: '50px', width: '100%', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: '24px', flex: '1', fontFamily: 'Arial, sans-serif' }}>Pharma Supply Chain</h1>
        <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex', gap: '30px' }}>
          <li>
            <a href="/allocatedistributor" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>Allocate Distributor</a>
          </li>
          <li>
            <a href="/viewdistributor" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>View Distributor</a>
          </li>
          <li>
            <a href="/" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'Arial, sans-serif' }}>Logout</a>
          </li>
        </ul>
      </div>
    </nav>
  
    <div style={{ backgroundColor: '#f0f0f0', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '80%', maxWidth: '800px', backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
        <div className="allocate-distributor">
          <h2 style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', marginBottom: '30px' }}>ALLOCATE DISTRIBUTOR</h2>
          <form onSubmit={handleAllocateDistributor} style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="medicineId" style={{ marginRight: '10px', display: 'inline-block', width: '120px', textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>Medicine ID:</label>
              <input
                type="number"
                id="medicineId"
                value={medicineId}
                onChange={(e) => setMedicineId(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: 'calc(100% - 150px)', fontFamily: 'Arial, sans-serif' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="distributorName" style={{ marginRight: '10px', display: 'inline-block', width: '120px', textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>Name:</label>
              <input
                type="text"
                id="distributorName"
                value={distributorName}
                onChange={(e) => setDistributorName(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: 'calc(100% - 150px)', fontFamily: 'Arial, sans-serif' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="distributorAddress" style={{ marginRight: '10px', display: 'inline-block', width: '120px', textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>Distributor Address:</label>
              <input
                type="text"
                id="distributorAddress"
                value={distributorAddress}
                onChange={(e) => setDistributorAddress(e.target.value)}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: 'calc(100% - 150px)', fontFamily: 'Arial, sans-serif' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 30px', backgroundColor: '#555', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>Allocate Distributor</button>
          </form>
          {ipfsHash && (
            <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
              Tax Invoice:{" "}
              <a href={`http://127.0.0.1:8080/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                click here!
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
  
  
  
  
    
  );
};

export default AllocateDistributor;
