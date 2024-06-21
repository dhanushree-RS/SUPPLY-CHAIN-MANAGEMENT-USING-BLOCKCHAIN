// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    struct User {
        string name;
        string username;
        uint role;
        string companyName;
        string licenseNumber;
        string password;
        bool registered;
    }

    mapping(address => User) private users;
    mapping(string => address) private usernameToAddress;
    address[] private userAddresses;

    modifier onlyNotRegistered(address user) {
        require(!users[user].registered, "User already registered");
        _;
    }

    modifier onlyRegistered(address user) {
        require(users[user].registered, "User not registered");
        _;
    }

    constructor() {}

    function registerUser(address user, string memory name, string memory username, uint role, string memory companyName, string memory licenseNumber, string memory password) public onlyNotRegistered(user) {
        require(usernameToAddress[username] == address(0), "Username already exists");
        
        users[user] = User(name, username, role, companyName, licenseNumber, password, true);
        userAddresses.push(user);
        usernameToAddress[username] = user;
    }

   function loginUser(string memory username, string memory password) public view returns (bool) {
    address userAddress = usernameToAddress[username];
    require(userAddress != address(0), "User not found");

    // Retrieve the user data using the Ethereum address mapped to the username
    User memory user = users[userAddress];
    
    // Check if the provided password matches the stored password for the user
    return keccak256(abi.encodePacked(user.password)) == keccak256(abi.encodePacked(password));
}

    function getUserRole(address user) public view onlyRegistered(user) returns (uint) {
        return users[user].role;
    }

    function viewUsers() public view returns(address[] memory, string[] memory, string[] memory, uint[] memory, string[] memory, string[] memory, string[] memory) {
        address[] memory addresses = new address[](userAddresses.length);
        string[] memory names = new string[](userAddresses.length);
        string[] memory usernames = new string[](userAddresses.length);
        uint[] memory roles = new uint[](userAddresses.length);
        string[] memory companyNames = new string[](userAddresses.length);
        string[] memory licenseNumbers = new string[](userAddresses.length);
        string[] memory passwords = new string[](userAddresses.length);

        for (uint i = 0; i < userAddresses.length; i++) {
            addresses[i] = userAddresses[i];
            names[i] = users[userAddresses[i]].name;
            usernames[i] = users[userAddresses[i]].username;
            roles[i] = users[userAddresses[i]].role;
            companyNames[i] = users[userAddresses[i]].companyName;
            licenseNumbers[i] = users[userAddresses[i]].licenseNumber;
            passwords[i] = users[userAddresses[i]].password;
        }

        return (addresses, names, usernames, roles, companyNames, licenseNumbers, passwords);
    }
}
