// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9; // This tells that what solidity version you are using....

import "hardhat/console.sol";
import "./Token.sol"; // "." means it is the current directory which is the same file "Exchange.sol" 
// and "Token.sol" is present in the same directory  which is the contracts directory...

contract Exchange{
    address public feeAccount; // This is the account that is going to receive the exchange fees.....
    // We can set this feeAccount inside the constructor dynamically....

    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) public tokens; // The first argument is going to
    // be the token address and second argument is going to be the user address and how many tokens they have deposited....

    // Orders mapping....

    mapping(uint256 => _Order) public orders;

    uint256 public orderCount; // Total no of orders created in this smart contract......

    mapping(uint256 => bool) public orderCancelled; // true (or) false...Storing all the Cancelled orders in a special mapping

    mapping(uint256 => bool) public orderFilled;

    event Deposit(
        address token , 
        address user , 
        uint256 amount , 
        uint256 balance
     ); // Created a deposit event....

    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    event Order(
        uint256 id, 
        address user, 
        address tokenGet, 
        uint256 amountGet, 
        address tokenGive, 
        uint256 amountGive, 
        uint256 timestamp 
   );

   event Cancel(
    uint256 id,
    address user,
    address tokenGet ,
    uint256 amountGet,
    address tokenGive,
    uint256 amountGive,
    uint256 timestamp
   );
  
    // address creator  - This is the person who creates the order...
   event Trade(  
    uint256 id,
    address user,
    address tokenGet,
    uint256 amountGet,
    address tokenGive,
    uint256 amountGive,
    address creator, 
    uint256 timestamp
  );

    // A way to model the order.....
    struct _Order{
        // Attributes of an order
        uint256 id; // Unique identifier for an order
        address user; // User who made the order
        address tokenGet; // Address of the token they receive
        uint256 amountGet; // Amount they receive
        address tokenGive; // Address of the token they will give
        uint256 amountGive; //  Amount they send (or) give
        uint256 timestamp; // At what time the order has been created
    }


    constructor(address _feeAccount , uint256 _feePercent){
        feeAccount = _feeAccount ;
        feePercent = _feePercent ;
    }

    // ------------------------------
    // DEPOSIT AND WITHDRAW TOKEN

    function depositToken(address _token , uint256 _amount) public {
        // Transfer tokens to exchange...
        require(Token(_token).transferFrom(msg.sender , address(this) , _amount));
        // Update user balance...
         tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;
        // Emit an event....
        emit Deposit(_token , msg.sender , _amount , tokens[_token][msg.sender]);
    } 


    function withdrawToken(address _token , uint256 _amount) public {

         // Ensure user has enough tokens to withdraw...
         require(tokens[_token][msg.sender] >= _amount);
        
         // Transfer the tokens to the user....
         Token(_token).transfer(msg.sender , _amount); 
        
         // Update the user balance....
      
         tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;
        
          // Emit an event......

          emit Withdraw(_token , msg.sender , _amount , tokens[_token][msg.sender]);
    }

    // Check balances....
    function balanceOf(address _token , address _user)
    public 
    view
    returns (uint256)
    {
        return tokens[_token][_user];
    }


    // -----------------------
    // MAKE AND CANCEL ORDERS

    

    function makeOrder(
        address _tokenGet , 
        uint256 _amountGet ,  
        address _tokenGive , 
        uint256 _amountGive 
        )  public {
        // Token Give (the token they want to spend) - which token, and how much ?
        // Token Get (the token they want to receive) - which token, and how much ?

         // Require token balance....

     require(balanceOf(_tokenGive, msg.sender) >= _amountGive); // Prevent orders if tokens aren't on exchange...

          // CREATE ORDER (or) Initializing a new order....     
           orderCount++;
          orders[orderCount] = _Order(
            orderCount , // ID
            msg.sender , // user
            _tokenGet , // tokenGet
            _amountGet , // amountGet
             _tokenGive , // tokenGive
            _amountGive , // amountGive
            block.timestamp // timestamp
           );

            // EMIT EVENT
            emit Order(
                orderCount,
                msg.sender,
                _tokenGet,
                _amountGet,
                _tokenGive,
                _amountGive,
                block.timestamp
            );
      }

      function cancelOrder(uint256 _id) public {
         
        // Fetching the order.... 
          _Order storage _order = orders[_id]; // The data type of _order is "_Order" and we are pulling it out of storage , So we have to write storage keyword after the data type....

           // Ensure the caller of the function is the owner of the order....
             require(address(_order.user) == msg.sender); 

         // Order must exist....
         require(_order.id == _id);

         // Cancel the order...
         orderCancelled[_id] = true;

         // Emit the Cancelled order event..
         emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
         );

      }

      // -----------------
      // EXECUTING ORDERS

      function fillOrder(uint256 _id ) public {
     
        // 1. Must be a valid orderID
             require(_id > 0 && _id <= orderCount, "Order does not exist");
        // 2. Order can't be filled
             require(!orderFilled[_id]);
        // 3. Order can't be cancelled
           require(!orderCancelled[_id]);



        // Fetch the order
        _Order storage _order = orders[_id]; // We have taken order out of the storage for mapping....
        
        
        // Swapping tokens (Trading the tokens)
            _trade(
            _order.id , 
            _order.user , 
             _order.tokenGet,
              _order.amountGet,
             _order.tokenGive,
             _order.amountGive
           );

           // Mark the order as filled.....
           orderFilled[_order.id] = true;

      } 

      function _trade(
        uint256 _orderId ,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
      ) internal {

          // Fees is paid by the user who filled the order (msg.sender)
          // Fees is deducted from _amountGet....
          uint256 _feeAmount = (_amountGet * feePercent) / 100; // This will give the 10% fees to the fee account..


        // Doing trade here which means the tokens are exchanged between user1 and user2 (Execute the trade)
        // msg.sender is the user who filled the order , while _user is who created the order...
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount); // Here msg.sender is the user2 who want to exchange his mdai tokens with user1's DAPP tokens...
        tokens[_tokenGet][_user] =  tokens[_tokenGet][_user] + _amountGet; // In this step we have taken the mdai token from user2 balance and added the mdai token to user1 balance.....

        // Charge the fees.......
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;
         
         tokens[_tokenGive][_user] =  tokens[_tokenGive][_user] - _amountGive; // In this step user1 is giving his DAPP token from his account balance that's why we are substracting one DAPP token from his account balance.......
         tokens[_tokenGive][msg.sender] =  tokens[_tokenGive][msg.sender] + _amountGive; // In this step we have taken the DAPP token from user1 balance and added the DAPP token to user2 balance.....

         // Emit the trade event....
         emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user, // Here user is the creator who has created the order.....
            block.timestamp
         );
      }
}