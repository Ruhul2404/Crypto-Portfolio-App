import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [tokens, setTokens] = useState([
    { symbol: "ETH", address: "0x...", balance: 0 },
    { symbol: "DAI", address: "0x...", balance: 0 },
  ]);
  const [newTokenSymbol, setNewTokenSymbol] = useState("");
  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const ERC20_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
  ];

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
    } else {
      alert("MetaMask is not installed. Please install it to use this app.");
    }
  };

  const fetchTokenBalance = async (tokenAddress, walletAddress) => {
    if (!walletAddress) return "0";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider
    );
    const balance = await tokenContract.balanceOf(walletAddress);
    return ethers.utils.formatUnits(balance, 18);
  };

  const fetchTokenAllowance = async (tokenAddress, spenderAddress) => {
    if (!walletAddress) return "0";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider
    );
    const allowance = await tokenContract.allowance(
      walletAddress,
      spenderAddress
    );
    return ethers.utils.formatUnits(allowance, 18);
  };

  const transferToken = async (tokenAddress, recipientAddress, amount) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      );
      const tx = await tokenContract.transfer(
        recipientAddress,
        ethers.utils.parseUnits(amount.toString(), 18)
      );
      await tx.wait();
      alert("Transfer successful!");
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("Transfer failed. Check the console for details.");
    }
  };

  useEffect(() => {
    if (walletAddress) {
      tokens.forEach(async (token) => {
        const balance = await fetchTokenBalance(token.address, walletAddress);
        setTokens((prev) =>
          prev.map((t) => (t.symbol === token.symbol ? { ...t, balance } : t))
        );
      });
    }
  }, [walletAddress, tokens]);

  const handleAddToken = () => {
    const newToken = {
      symbol: newTokenSymbol,
      address: newTokenAddress,
      balance: 0,
    };
    setTokens((prev) => [...prev, newToken]);
    setNewTokenSymbol("");
    setNewTokenAddress("");
  };

  const handleTransferToken = async () => {
    await transferToken(tokens[0].address, transferRecipient, transferAmount);
    setTransferRecipient("");
    setTransferAmount(0);
  };

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"], // You can update these labels based on your data
    datasets: [
      {
        label: "Token Balance",
        data: tokens.map((token) => parseFloat(token.balance)),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={connectWallet}>
        {walletAddress ? `Connected: ${walletAddress}` : "Connect Wallet"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>Token Watch List</h3>
        <input
          type="text"
          placeholder="Token Symbol"
          value={newTokenSymbol}
          onChange={(e) => setNewTokenSymbol(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token Address"
          value={newTokenAddress}
          onChange={(e) => setNewTokenAddress(e.target.value)}
        />
        <button onClick={handleAddToken}>Add Token</button>
        <ul>
          {tokens.map((token) => (
            <li key={token.symbol}>
              {token.symbol}: {token.balance}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Token Transfer</h3>
        <input
          type="text"
          placeholder="Recipient Address"
          value={transferRecipient}
          onChange={(e) => setTransferRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={transferAmount}
          onChange={(e) => setTransferAmount(Number(e.target.value))}
        />
        <button onClick={handleTransferToken}>Transfer</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Historical Data</h3>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
        />
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
        {/* You would need to fetch and display historical data here */}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Data Visualizations</h3>
        <Line data={data} />
      </div>
    </div>
  );
}

export default App;
