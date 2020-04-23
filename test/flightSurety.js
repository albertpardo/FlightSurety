
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract ', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);   //Don't defined in boilPlater code
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`1 - (multiparty) has correct initial isOperationalContract() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperationalContract.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`2 - (multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`3 - (multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`4 - (multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('5 - (airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isOperationalAirline.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  /****************************************************************************************/
  /* MY TEST on Operations and Settings                                                   */
  /****************************************************************************************/
  it('6 - (airline) the first Airline defined in Test object is registred and no operational' , async () => {
    let result1 = await config.flightSuretyData.isRegisteredAirline.call(config.firstAirline);
    let result2 = await config.flightSuretyData.isOperationalAirline.call(config.firstAirline);
    // ASSERT
    assert.equal(result1,true, "Error: First Airline is not registered");
    assert.equal(result2,false, "Error : First Airline is Operational");
  });
 

  // it('7 - (airline) first Airline pay Bad Fees .  NO Operational' , async () => {
  //   let fee = web3.utils.toWei('5', "ether");

  //   try {
  //     await config.flightSuretyApp.fundFeeToBeOperational({from: config.firstAirline, value: fee});
  //   }
  //   catch(e){
  //     //console.log(e);
  //   }
    
  //   let result = await config.flightSuretyData.isOperationalAirline.call(config.firstAirline);

  //   // ASSERT
  //   assert.equal(result,false, "Not valit transaction - First Airline is Operational");
    
  // });

  it('8 - (airline) first Airline pay to be Operational' , async () => {
    let fee = web3.utils.toWei('10', "ether");

    try {
      await config.flightSuretyApp.fundFeeToBeOperational({from: config.firstAirline, value: fee});
    }
    catch(e){
      console.log(e);
    }
    
    let result = await config.flightSuretyData.isOperationalAirline.call(config.firstAirline);

    // ASSERT
    assert.equal(result,true, "Not valit transaction - The First Airline is NOT Operational");
  });

});
