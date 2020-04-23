pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Struct used to hold registered airlines
    struct Airlines {
        bool isRegistered;
        bool isOperational;
    }

    address private contractOwner;                       // Account used to deploy contract
    bool private operationalContract = true;             // Blocks all state changes throughout the contract if false

    address[] keyAirlinesRegistered = new address[](0);  // Keys to know what accounts are added in "airlines"
    mapping (address => Airlines) airlines;
    mapping (address => uint256) airlinesToRegister;     //Airlines list with cumulative votes waiting to be register

    uint256 private balance;                            // Contract balance for pay Surety to passengers
    uint256 constant airlineFee = 10 ether;             // Fee to be apported by an Airline to be Operational

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/



    /********************************************************************************************/
    /*                                       Constructor                                        */
    /********************************************************************************************/

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor() public {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperationalContract()
    {
        require(operationalContract, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // /**
    // * @dev Modifier that requires the "msg.sender" is Airline registered
    // */
    // modifier requireAirlineRegistered() {
    //     require (airlines[msg.sender].isRegistered, "Airline no Registered");
    //     _;
    // }


    /**
    * @dev Modifier that requires the "msg.values" is 10 ethers
    */
    modifier requireFeesToBeOperational(uint256 value){
        require (value == airlineFee, "Don't valid fee apported by Airline");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperationalContract() public view returns(bool) {
        return operationalContract;
    }

    function isOperationalAirline(address account) public view returns(bool)
    {
        return airlines[account].isOperational;
    }

    function isRegisteredAirline(address account) public view returns(bool)
    {
        return airlines[account].isRegistered;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus( bool mode) external requireContractOwner {
        operationalContract = mode;
    }

    /**
    * @dev Get consensus Status
    *
    * Rules for Consensus using M in N  (Where M is the minimum acept votes from N voters )
    *   -  M = 1  When (number of registered Airlines =< 4)
    *   -  M >= N/2 When (number of registered Airlines > 4)   >= 50% Consensus
    */
    function isConsensus(address account) external returns(bool){
        uint256 M = 1;
        //verify consensous for moren than 4 regitred airlines
        airlinesToRegister[account] = airlinesToRegister[account].add(1);
        // Update M
        if (keyAirlinesRegistered.length > 4) {
            M = keyAirlinesRegistered.length.div(2);
            if (M.mul(2) < keyAirlinesRegistered.length) M = M.add(1);
        }
        // look for consensus status
        if (airlinesToRegister[account] >= M ) {
            airlinesToRegister[account] = 0;     // Reset
               return true;
        }
        return false;
    }
    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function _registerAirline( address account,
                               bool isOperational
                             ) external
                             requireIsOperationalContract   // Verify if this contract is ON
    {
        airlines[account] = Airlines({ isRegistered: true, isOperational: isOperational});
        keyAirlinesRegistered.push(account);       //To know the account registered
    }


   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy( ) external payable {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees( ) external pure {
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay( ) external  pure {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund(address account, uint256 value) public payable requireFeesToBeOperational(value) {
        balance = balance.add(value);
        airlines[account].isOperational = true;
    }

    function getFlightKey( address airline,
                           string memory flight,
                           uint256 timestamp
                        ) internal  pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() external payable {
       // fund();
    }


}

