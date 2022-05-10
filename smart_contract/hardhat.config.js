//https://eth-rinkeby.alchemyapi.io/v2/7DKAMMTZ7J1NkC89JKXn4c7jfqsy_zBV
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/7DKAMMTZ7J1NkC89JKXn4c7jfqsy_zBV",
      accounts: [
        "496054c0fc7801f20b707f7a1d7b3eb448117709fbdd73c66b69554e70bbadf3",
      ],
    },
  },
};
