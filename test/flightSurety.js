
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract ', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);   //Don't defined in boilPlater code
  });

  let airlinesList = {
    airline1: accounts[1],
    airline2: accounts[2],
    airline3: accounts[3],
    airline4: accounts[4],
    airline5: accounts[5],
    airline6: accounts[6]
  }
  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  // it(`1 - (multiparty) has correct initial isOperationalContract() value`, async function () {

  //   // Get operating status
  //   let status = await config.flightSuretyData.isOperationalContract.call();
  //   assert.equal(status, true, "Incorrect initial operating status value");

  // });

  // it(`2 - (multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

  //     // Ensure that access is denied for non-Contract Owner account
  //     let accessDenied = false;
  //     try 
  //     {
  //         await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
  //     }
  //     catch(e) {
  //         accessDenied = true;
  //     }
  //     assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  // });

  // it(`3 - (multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

  //     // Ensure that access is allowed for Contract Owner account
  //     let accessDenied = false;
  //     try 
  //     {
  //         await config.flightSuretyData.setOperatingStatus(false);
  //     }
  //     catch(e) {
  //         accessDenied = true;
  //     }
  //     assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  // });

  // it(`4 - (multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

  //     await config.flightSuretyData.setOperatingStatus(false);

  //     let reverted = false;
  //     try 
  //     {
  //         await config.flightSurety.setTestingMode(true);
  //     }
  //     catch(e) {
  //         reverted = true;
  //     }
  //     assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

  //     // Set it back for other tests to work
  //     await config.flightSuretyData.setOperatingStatus(true);

  // });

  // it('5 - (airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
  //   // ARRANGE
  //   let newAirline = accounts[2];

  //   // ACT
  //   try {
  //       await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
  //   }
  //   catch(e) {

  //   }
  //   let result = await config.flightSuretyData.isOperationalAirline.call(newAirline); 

  //   // ASSERT
  //   assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  // });

  /****************************************************************************************/
  /* MY TEST on Operations and Settings                                                   */
  /****************************************************************************************/
  it('1 - (airline) the first Airline defined in Test object is registred and no operational' , async () => {
    // No event expected, because was sent when the contract was created

    let result1 = await config.flightSuretyData.isRegisteredAirline.call(airlinesList.airline1);
    let result2 = await config.flightSuretyData.isOperationalAirline.call(airlinesList.airline1);

    // ASSERT
    assert.equal(result1,true, "Error: First Airline is not registered");
    assert.equal(result2,false, "Error : First Airline is Operational");
  });

  it('2 - (airline) first Airline cannot register an Airline using registerAirline() if it is not funded', async () => {
    // No event expected, because firstAirline is not Operatinal.So it can not registered any new.
    // ARRANGE
    let newAirline = airlinesList.airline2;

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: airlinesList.airline1});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isOperationalAirline.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });
 
  it('3 - (airline) first Airline pay to be Operational and change to Operational' , async () => {
    let fee = web3.utils.toWei('10', "ether")

    // Declare and Initialize a variable for events
    let AirlineFunded = false

    // Watch the emitted event AirlineFunded()
    await config.flightSuretyData.AirlineFunded((err, res) => {
      AirlineFunded = true
      console.log(res)
    })

    try {
      await config.flightSuretyApp.fundFeeToBeOperational({from: airlinesList.airline1, value: fee});
    }
    catch(e){
      console.log("ERROR : ")
      console.log(e)
    }
    
    let result = await config.flightSuretyData.isOperationalAirline.call(airlinesList.airline1);

    // ASSERT
    assert.equal(AirlineFunded, true, "AirlineFunded NO EMMITED")
    assert.equal(result,true, "Not valid transaction - The First Airline is NOT Operational");
  });

  it('4 - (airline) firstAirline can register an Airline using registerAirline() because is operational', async () => {
    
    // ARRANGE
    let newAirline = airlinesList.airline2;

    // Declare and Initialize a variable for events
    let AirlineRegistered = false

    // Watch the emitted event AirlineRegistered()
    await config.flightSuretyData.AirlineRegistered((err, res) => {
      AirlineRegistered = true
    })

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: airlinesList.airline1});
    }
    catch(e) {
      console.log("ERROR : ")
      console.log(e)
    }
    let result = await config.flightSuretyData.isRegisteredAirline.call(newAirline); 

    // let balance = await config.flightSuretyData.getBalance.call()
    // console.log("Balance (Ethers): " + web3.utils.fromWei(balance,'ether'))

    // ASSERT
    assert.equal(AirlineRegistered, true, "Error : AirlineRegistered NO EMMITTED")
    assert.equal(result, true, "Error : First Airline not register another airline");

  });

  it('5 - (airline) second Airline pay to be Operational and change to Operational' , async () => {
    let fee = web3.utils.toWei('10', "ether")

    // Declare and Initialize a variable for events
    let AirlineFunded = false

    // Watch the emitted event AirlineFunded()
    await config.flightSuretyData.AirlineFunded((err, res) => {
      AirlineFunded = true
    })

    try {
      await config.flightSuretyApp.fundFeeToBeOperational({from: airlinesList.airline2, value: fee});
    }
    catch(e){
      console.log("ERROR : ")
    }
    
    let result = await config.flightSuretyData.isOperationalAirline.call(airlinesList.airline2);

    // ASSERT
    assert.equal(AirlineFunded, true, "AirlineFunded NO EMMITED")
    assert.equal(result,true, "Not valid transaction - The second Airline is NOT Operational");
  });

  it('6 - (airline) second Airline is Operational and registered 2 more airlines', async () => {

    let newAirlines = [ airlinesList.airline3, airlinesList.airline4]

    // Declare and Initialize a variable for events
    let AirlineRegistered = false
  
    let result = false

    newAirlines.forEach(async (newAirline) =>{
      // Watch the emitted event AirlineRegistered()
      await config.flightSuretyData.AirlineRegistered((err, res) => {
         AirlineRegistered = true
      })

      // ACT
      try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: airlinesList.airline2});
      }
      catch(e) {
        console.log("ERROR : ")
        console.log(e)
      }
      
      result = await config.flightSuretyData.isRegisteredAirline.call(newAirline); 
      
      // ASSERT
      assert.equal(AirlineRegistered, true, "Error : AirlineRegistered NO EMMITTED")
      assert.equal(result, true, "Error : First Airline not register another airline");
    })
  });

});
