//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    string constant ManufacturingStatus = "Manufactured, ready to Dispatch";
    string constant InTransitStatus = "InTransit";
    string constant DeliveredStatus = "verified and Delivered";
    string constant ManageInventoryStatus = "Sent to Quality Check";
    string constant QualityCheckedStatus = "Quality Checked";
    string constant QualityCheckFailedStatus = "Quality Check Failed";
   

    struct Medicine {
        uint256 id;
        string prefix;
        string name;
        string composition;
        string description;
        string manufacturerDate;
        string expiryDate;
        uint256 price;
        string ipfsHash;
        string currentStatus;
        
        //uint256 quantity; // Added quantity field for inventory management
    }

    struct MedicineOwnership {
    address manufacturer;
    address wholesaler;
    address distributor;
    address hospital;
    address patient;
    string ipfsHashMedicine;
    string ipfsHashDistributor;
    string ipfsHashHospital;
    }


    mapping(uint256 => Medicine) public medicines;
    mapping(string => uint256) public medicineIdByIpfsHash;
    uint256 public medicineCount;
    mapping(uint256 => bool) public isMedicineChecked;
    mapping(uint256 => MedicineOwnership) public medicineOwnership;

    event MedicineCreated(uint256 id,  string name);
    event MedicineAllocated(uint256 id, string name, address wholesaler);
    event MedicineAllocatedToDistributor(uint256 id, string name, address distributor);
    event MedicinePurchased(uint256 id, string name, address purchaser);
    event QualityCheckPerformed(uint256 id, string name, bool check);
    event MedicineShippedToHospital(uint256 indexed id, string name, address hospital);
   event  MedicineAllocatedToHospital(uint256 id, string name , address hospital);
   event MedicineReceived(uint256 id, string name, address hospital);
    
    constructor() {}

    function createMedicine(
        string memory _prefix,
        string memory _name,
        string memory _composition,
        string memory _description,
        string memory _manufacturerDate,
        string memory _expiryDate,
        uint256 _price,
        string memory _ipfsHash
    
    ) external {
        uint256 id = medicineCount + 1;
        medicines[id] = Medicine({
            id: id,
            prefix: _prefix,
            name: _name,
            composition: _composition,
            description: _description,
            manufacturerDate: _manufacturerDate,
            expiryDate: _expiryDate,
            price: _price,
            ipfsHash: _ipfsHash,
            currentStatus: ManufacturingStatus
            //quantity: 0
        });



        medicineIdByIpfsHash[_ipfsHash] = id;

        medicineCount++;
        emit MedicineCreated(id, _name);
    }

    function allocateMedicine(
        uint256 _id,
        address _wholesaler,
        string memory _medicineIpfsHash
    ) external {
        require(medicines[_id].id == _id, "Medicine does not exist");
        require(medicineOwnership[_id].wholesaler == address(0), "Medicine already allocated");

         medicines[_id].currentStatus = "Shipped to Wholesaler";
        

        medicines[_id].ipfsHash = _medicineIpfsHash;
        medicineOwnership[_id].wholesaler = _wholesaler;
        medicineOwnership[_id].ipfsHashMedicine = _medicineIpfsHash;
        emit MedicineAllocated(_id, medicines[_id].name, _wholesaler);
    }


function getAllocatedMedicineByAddress(address _address) external view returns (
    uint256[] memory ids,
    string[] memory prefixes,
    string[] memory names,
    string[] memory compositions,
    string[] memory descriptions,
    string[] memory manufacturerDates,
    string[] memory expiryDates,
    uint256[] memory prices,
    string[] memory statuses,
    string[] memory ipfsHashes
) {
    uint256 count = 0;
    for (uint256 i = 1; i <= medicineCount; i++) {
        if (
            medicineOwnership[i].manufacturer == _address ||
            medicineOwnership[i].wholesaler == _address ||
            medicineOwnership[i].distributor == _address ||
            medicineOwnership[i].hospital == _address
        ) {
            count++;
        }
    }

    ids = new uint256[](count);
    prefixes = new string[](count);
    names = new string[](count);
    compositions = new string[](count);
    descriptions = new string[](count);
    manufacturerDates = new string[](count);
    expiryDates = new string[](count);
    prices = new uint256[](count);
    statuses = new string[](count);
    ipfsHashes = new string[](count);

    uint256 index = 0;
    for (uint256 j = 1; j <= medicineCount; j++) {
        if (
            medicineOwnership[j].manufacturer == _address ||
            medicineOwnership[j].wholesaler == _address ||
            medicineOwnership[j].distributor == _address ||
            medicineOwnership[j].hospital == _address
        ) {
            Medicine memory medicine = medicines[j];
            ids[index] = medicine.id;
            prefixes[index] = medicine.prefix;
            names[index] = medicine.name;
            compositions[index] = medicine.composition;
            descriptions[index] = medicine.description;
            manufacturerDates[index] = medicine.manufacturerDate;
            expiryDates[index] = medicine.expiryDate;
            prices[index] = medicine.price;
            statuses[index] = medicine.currentStatus;

            // Determine the IPFS hash based on ownership
            if (medicineOwnership[j].manufacturer == _address) {
                ipfsHashes[index] = medicineOwnership[j].ipfsHashMedicine;
            } else if (medicineOwnership[j].wholesaler == _address) {
                ipfsHashes[index] = medicineOwnership[j].ipfsHashMedicine;
            } else if (medicineOwnership[j].distributor == _address) {
                ipfsHashes[index] = medicineOwnership[j].ipfsHashDistributor;
            } else if (medicineOwnership[j].hospital == _address) {
                ipfsHashes[index] = medicineOwnership[j].ipfsHashHospital;
            }
            
            index++;
        }
    }
}




    function getMedicineById(
        uint256 _id
    )
        external
        view
        returns (
            uint256 id,
            string memory prefix,
            string memory name,
            string memory composition,
            string memory description,
            string memory manufacturerDate,
            string memory expiryDate,
            uint256 price,
            string memory ipfsHash,
            address wholesaler,
            string memory currentStatus
        )
    {
        require(_id > 0 && _id <= medicineCount, "Invalid medicine ID");

        Medicine memory medicine = medicines[_id];
        MedicineOwnership memory ownership = medicineOwnership[_id];
        return (
            medicine.id,
           medicine.prefix,
            medicine.name,
            medicine.composition,
            medicine.description,
            medicine.manufacturerDate,
            medicine.expiryDate,
            medicine.price,
            medicine.ipfsHash,
            ownership.wholesaler,
            medicine.currentStatus
        );
    }

    function allocateDistributor(uint256 _id, address _distributor, string memory _ipfsHash) external {
        require(medicines[_id].id == _id, "Medicine does not exist");
        require(
            medicineOwnership[_id].wholesaler != address(0),
            "Medicine has not been allocated to a wholesaler"
        );
        require(
            medicineOwnership[_id].distributor == address(0),
            "Medicine already allocated to distributor"
        );

        medicines[_id].currentStatus = "Shipped to Distributor";

        medicineOwnership[_id].distributor = _distributor;
         medicineOwnership[_id].ipfsHashDistributor = _ipfsHash;
        emit MedicineAllocatedToDistributor(
            _id,
            medicines[_id].name,
            _distributor
        );
    }


     function performQualityCheck(
    uint256 _id,
    bool _checkQuality
   
) external {
    require(medicines[_id].id == _id, "Medicine does not exist");
    require(!isMedicineChecked[_id], "Medicine already checked");

    if (_checkQuality) {
        medicines[_id].currentStatus = QualityCheckedStatus;
    } else {
        medicines[_id].currentStatus = QualityCheckFailedStatus;
    }

   

    isMedicineChecked[_id] = true;

    emit QualityCheckPerformed(_id, medicines[_id].name, _checkQuality);


}


 function allocateMedicineToHospital(uint256 _id, address _hospital, string memory _ipfsHash) external {
        require(medicines[_id].id == _id, "Medicine does not exist");
        require(
            medicineOwnership[_id].distributor != address(0),
            "Medicine has not been allocated to a distributor"
        );
        require(
            medicineOwnership[_id].hospital == address(0),
            "Medicine already allocated to hospital"
        );
        
        medicines[_id].currentStatus = "Quality Checked";

        medicineOwnership[_id].hospital = _hospital;
        medicineOwnership[_id].ipfsHashHospital = _ipfsHash;
        emit MedicineAllocatedToHospital(
            _id,
            medicines[_id].name,
            _hospital
        );
    }
    
    



function shipMedicineToHospital(uint256 _id) external {
    require(medicines[_id].id == _id, "Medicine does not exist");
    require(
        medicineOwnership[_id].distributor != address(0),
        "Medicine has not been allocated to a distributor"
    );
    require(
        keccak256(abi.encodePacked(medicines[_id].currentStatus)) == keccak256(abi.encodePacked(QualityCheckedStatus)),
        "Medicine quality not checked yet"
    );
    require(
        keccak256(abi.encodePacked(medicines[_id].currentStatus)) != keccak256(abi.encodePacked(DeliveredStatus)),
        "Medicine already delivered"
    );

    // Update medicine status to "InTransit"
    medicines[_id].currentStatus = InTransitStatus;

    // Emit event to notify the shipment
    emit MedicineShippedToHospital(_id, medicines[_id].name, medicineOwnership[_id].hospital);
}

function verifyIPFSHashes(uint256 _id, string memory _manufacturerHash, string memory _wholesalerHash, string memory _distributorHash) external {
    require(medicines[_id].id == _id, "Medicine does not exist");

    // Verify the manufacturer's IPFS hash
    require(
        keccak256(abi.encodePacked(medicineOwnership[_id].ipfsHashMedicine)) == keccak256(abi.encodePacked(_manufacturerHash)),
        "Manufacturer's IPFS hash does not match"
    );

    // Verify the wholesaler's IPFS hash
    require(
        keccak256(abi.encodePacked(medicineOwnership[_id].ipfsHashDistributor)) == keccak256(abi.encodePacked(_wholesalerHash)),
        "Wholesaler's IPFS hash does not match"
    );

    // Verify the distributor's IPFS hash
    require(
        keccak256(abi.encodePacked(medicineOwnership[_id].ipfsHashHospital)) == keccak256(abi.encodePacked(_distributorHash)),
        "Distributor's IPFS hash does not match"
    );

    // Update medicine status to "Quality Checked"
    //medicines[_id].currentStatus = QualityCheckedStatus;

    // Emit event to notify the verification
    emit QualityCheckPerformed(_id, medicines[_id].name, true);
    
    // Update medicine status to "Delivered"
    medicines[_id].currentStatus = DeliveredStatus;
}


function sellMedicine(uint256 _id) external payable {
    require(msg.value == 5 ether, "Exactly 5 ethers must be sent to purchase medicine");
    require(medicines[_id].id == _id, "Medicine does not exist");
    require(
        keccak256(abi.encodePacked(medicines[_id].currentStatus)) == keccak256(abi.encodePacked(DeliveredStatus)),
        "Medicine not verified and delivered yet"
    );

    // Update medicine status to "Purchased"
    medicines[_id].currentStatus = "purchased";

    // Emit event to notify the purchase
    emit MedicinePurchased(_id, medicines[_id].name, msg.sender);
}

function buyMedicine(uint256 _id) external payable {
    require(msg.value == 5 ether, "Exactly 5 ethers must be sent to purchase medicine");
    require(medicines[_id].id == _id, "Medicine does not exist");
    require(
        keccak256(abi.encodePacked(medicines[_id].currentStatus)) == keccak256(abi.encodePacked(DeliveredStatus)),
        "Medicine not verified and delivered yet"
    );
    require(medicineOwnership[_id].hospital != address(0), "Medicine not allocated to hospital yet");

    // Transfer 5 ethers from the buyer to the hospital
    address payable hospitalAddress = payable(medicineOwnership[_id].hospital);
    hospitalAddress.transfer(msg.value);

   medicineOwnership[_id].patient = msg.sender;


    // Update medicine status to "Purchased"
    medicines[_id].currentStatus = "Purchased";

    // Emit event to notify the purchase
    emit MedicinePurchased(_id, medicines[_id].name, msg.sender);
}

function trackMedicine(uint256 _id) external view returns (
    uint256 id,
    string memory prefix,
    string memory name,
    string memory composition,
    string memory description,
    string memory manufacturerDate,
    string memory expiryDate,
    uint256 price,
   // string memory ipfsHash,
    string memory currentStatus
) {
    require(_id > 0 && _id <= medicineCount, "Invalid medicine ID");

    Medicine memory medicine = medicines[_id];
    //MedicineOwnership memory ownership = medicineOwnership[_id];

    return (
        medicine.id,
        medicine.prefix,
        medicine.name,
        medicine.composition,
        medicine.description,
        medicine.manufacturerDate,
        medicine.expiryDate,
        medicine.price,
        //medicine.ipfsHash,
        medicine.currentStatus
    );
}


// function updateMedicineStatus(uint256 _id, string memory _status) external {
//     require(_id > 0 && _id <= medicineCount, "Invalid medicine ID");
//     Medicine storage medicine = medicines[_id];
//     medicine.currentStatus = _status;
//     medicine.statusHistory.push(_status); // Add the new status to status history
// }

// function trackMedicine(uint256 _id) external view returns (
//     uint256 id,
//     string memory prefix,
//     string memory name,
//     string memory composition,
//     string memory description,
//     string memory manufacturerDate,
//     string memory expiryDate,
//     uint256 price,
//     string memory currentStatus,
//     string[] memory statusHistory // Return status history
// ) {
//     require(_id > 0 && _id <= medicineCount, "Invalid medicine ID");
//     Medicine memory medicine = medicines[_id];
//     return (
//         medicine.id,
//         medicine.prefix,
//         medicine.name,
//         medicine.composition,
//         medicine.description,
//         medicine.manufacturerDate,
//         medicine.expiryDate,
//         medicine.price,
//         medicine.currentStatus,
//         medicine.statusHistory
//     );
// }







}

