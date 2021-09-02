pragma solidity ^0.5.0;

import "./TestToken.sol";

contract TestTokenSale {
    address payable admin;
    TestToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(
        address _buyer, 
        uint256 _amount
    );

    constructor(TestToken _tokenContract, uint256 _tokenPrice) public{
       admin = msg.sender;
       tokenContract = _tokenContract;
       tokenPrice = _tokenPrice;
    } 

    function buyTokens(uint256 _numberOfTokens) public payable{
        uint256 totalprice = multiply(tokenPrice, _numberOfTokens);

        require(totalprice <= msg.value);
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        

        tokenSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function multiply(uint x, uint y) internal pure returns (uint z){
        require(y == 0 || (z = x * y ) / y ==x);
    }

    function endSale() public{
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

        selfdestruct(admin);
        
    }
}