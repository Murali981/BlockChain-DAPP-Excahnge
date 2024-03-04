// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9; // This tells that what solidity version you are using....

import "hardhat/console.sol";

contract Token{
    string public name ;
    string public symbol ; // These are all state variables....
    uint256 public decimals = 18;  // 1000000000000000000wei(10^18wei) = 1 ether....
    uint256 public totalSupply;           //1000000 * (10**decimals); // 1,000,000 x 10^18.....


    // Track Balances
     mapping(address => uint256) public balanceOf; // Mapping is a data structure inside the solidity that stores information as well as
     // we can read information from it . It stores the information in the form of (key,value) pairs...Here the key is "address" and 
     // the value is "uint256" which is the number that tells how many tokens that particular address have which is the total balance
     // of tokens that particular address have.....Here the "balanceOf" is called a state variable and since we made it public then
     // Solidity is going to give us a special function that is accessible inside as well as outside the smart contract... 

     mapping(address => mapping(address => uint256)) public allowance ; // Here we have a nested mapping because whenever you have
     // put the owner address then it is going to return a mapping with all the potential spenders and how many tokens they have approved
     // for.........

      event Transfer 
      (
        address indexed from, 
        address indexed to , 
        uint256 value 
        );   // This event will be emitted (or) notified whenever a transfer event is occurred...."indexed" keyword is used to 
             // filter the events....

       event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
       );

    // Send Tokens

    constructor(
        string memory _name , 
        string memory _symbol , 
        uint256 _totalSupply
        ) 
      {
       name = _name;
       symbol = _symbol; // We are using underscore(_) to differentiate b/w state variables and local variables....
       totalSupply = _totalSupply * (10**decimals);
       balanceOf[msg.sender] = totalSupply; // msg is a global variable inside of the solidity where we can access it anywhere..
       // Sender is the person who is calling this function....Here in this context who is deploying this smart contract on the block
       // chain is the msg.sender here who is calling (or) invoking this constructor function....
    }

    function transfer(address _to , uint256 _value) 
    public 
    returns (bool success) 
  {
        // Require that sender has enough tokens to spend.....
           require(balanceOf[msg.sender] >= _value);
           
           _transfer(msg.sender , _to , _value); // Here we are internally calling the "_transfer()" function.......

         return true;

    }

    function _transfer(address _from , address _to , uint256 _value)  internal { // internal means it is a kind of private where everyone
    // can't call this "_transfer" function.........
           // Deduct tokens from the spender...
  
         require(_to != address(0)); // For transfer we don't want it to be the zero address........
            
        balanceOf[_from] = balanceOf[_from] - _value ; // deducting the tokens from the sender...
      // Credit the tokens to the receiver....
         balanceOf[_to] = balanceOf[_to] + _value; // _to is the receiver who receives the tokens....

          // Emit event
        emit Transfer( _from , _to , _value);   
    }

    function approve(address _spender , uint256 _value) 
    public 
    returns(bool success){ // The person who is approving the spender tokens
    // The approver tells how many tokens that the spender can spend the tokens on our behalf.......

         require(_spender != address(0));
         allowance[msg.sender][_spender] = _value; // msg.sender is always going to be the first address because he is the owner , 
         // To access a nested mapping here , we have to use two square brackets([][]) like this where the first bracket is for 
         // normal mapping and the second bracket is for nested mapping.........

          emit Approval(msg.sender , _spender , _value);

         return true;

    }

    function transferFrom(address _from , address _to , uint256 _value) public returns(bool success){

        console.log(_from , _to , _value);
         
          // Check Approval...

            require(_value <= balanceOf[_from] , 'insufficient balance'); // The person who is spending the tokens 
            // should have the enough tokens to transfer.....


           require(_value <= allowance[_from][msg.sender] , 'insufficient allowance'); // require is a function that we 
           // have in solidity , If this condition evaluates to true then you can execute the 
           // rest of the code which is inside this function and if it evaluates to false,
           // then just stop and throw the error.....The value should be less than (or) equal 
           // to the approved amount.....
          

          // Reset the Allowance....
          allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value; // If they spend
          // the entire allowance which is approved then they reset it back to zero(0) (or) if
          // they didn't spend the entire allowance which is approved , then they will substract 
          // the allowance that they have used from the total allowance which is approved...

          

          // Spend tokens....
          _transfer(_from , _to , _value);

          return true;

    }

    
}
