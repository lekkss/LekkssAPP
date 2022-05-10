import React, { useEffect, useState } from "react";
// import { ethers } from "ethers";
import { ethers } from "ethers";

import { contractAbi, contractAdress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAdress,
    contractAbi,
    signer
  );

  return transactionContract;
  //   console.log(provider, signer, transactionContract);
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install Metamask");
      const transactionContract = getEthereumContract();

      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timrstamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );
      setTransactions(structuredTransactions);
      console.log(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        return alert("Please install Metamask");
      }
      const account = await ethereum.request({ method: "eth_accounts" });
      if (account.length) {
        setCurrentAccount(account[0]);

        getAllTransactions();
      } else {
        console.log("No Accounts found");
      }
      //   console.log(account);
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object ");
    }
  };

  const checkIfTransactionsExixt = async () => {
    try {
      if (ethereum) {
        const transactionContract = getEthereumContract();
        const transactionCount =
          await transactionContract.getTransactionCount();

        window.localStorage.setItem("transactionCount", transactionCount);
      }
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object ");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert("Please Connect Metamask");
      }
      const account = await ethereum.request({ method: "eth_requestAccounts" });

      setCurrentAccount(account[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum object ");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) {
        return alert("Please Connect Metamask");
      }

      //get data from form
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", //2100 GWEI
            value: parsedAmount._hex, //0.0001
          },
        ],
      });
      const transactionHash = await transactionContract.addToBlockChain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`success - ${transactionHash.hash}`);

      const transactionsCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionsCount.toNumber());
      window.reload();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExixt();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        sendTransaction,
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        transactions,
        isloading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
