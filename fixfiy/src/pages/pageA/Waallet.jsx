

// import React, { useEffect, useState } from "react";
// import API from "../../services/api";
// import "./wallett.css";

// const Wallet = () => {
//   const [wallet, setWallet] = useState(null);

//   useEffect(() => {
//     fetchWallet();
//   }, []);

//   const fetchWallet = async () => {
//     try {
//       const res = await API.get("/wallet");
//       setWallet(res.data.data);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <div className="wallet-page">

//       <h2 className="title"> My Wallet</h2>

//       {/* Balance Card */}
//       <div className="balance-card">
//         <p className="label">Current Balance</p>
//         <h1 className="balance">
//           {wallet?.balance || 0} EGP
//         </h1>
//       </div>

//       {/* Transactions */}
//       <div className="transactions-card">

//         <h3> Transactions</h3>

//         {!wallet?.transactions?.length ? (
//           <p className="empty">No transactions yet</p>
//         ) : (
//           wallet.transactions.map((t, i) => (
//             <div key={i} className="transaction">

//               <div>
//                 <p className="type">{t.type}</p>
//                 <span className="date">
//                   {new Date(t.createdAt).toLocaleDateString()}
//                 </span>
//               </div>

//               <p className="amount">
//                 {t.amount} EGP
//               </p>

//             </div>
//           ))
//         )}

//       </div>

//     </div>
//   );
// };

// export default Wallet;


import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./wallett.css";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================
  // FETCH WALLET
  // ======================
  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await API.get("/wallet");
      setWallet(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // WITHDRAW REQUEST
  // ======================
  const requestWithdraw = async () => {
    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      setLoading(true);

      await API.post("/withdraw/request", {
        amount: Number(amount),
      });

      alert("Withdraw request sent successfully");

      setAmount("");

      // refresh wallet after request
      fetchWallet();
    } catch (err) {
      console.log(err.response?.data);
      alert("Error sending request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-page">

      <h2 className="title">My Wallet</h2>

      {/* ================= BALANCE ================= */}
      <div className="balance-card">
        <p className="label">Current Balance</p>
        <h1 className="balance">
          {wallet?.balance || 0} EGP
        </h1>
      </div>

      {/* ================= WITHDRAW =================  */}
       <div className="withdraw-card">

        <h3>Withdraw Money</h3>

        <p className="subtitle">
          Enter amount you want to withdraw
        </p>

        <input
          type="number"
          placeholder="Enter amount (EGP)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />

        <button
          onClick={requestWithdraw}
          className="btn"
          disabled={loading}
        >
          {loading ? "Processing..." : "Request Withdraw"}
        </button>

      </div>
{/* ================= WITHDRAW ================= */}
{/* <div className="withdraw-card">

  <div className="withdraw-header">
    <h3>Withdraw Money</h3>
    <p className="subtitle">
      Request withdrawal from your wallet balance
    </p>
  </div>

  <div className="withdraw-input-wrapper">
    <span className="currency">EGP</span>

    <input
      type="number"
      placeholder="0.00"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      className="withdraw-input"
    />
  </div>

  <button
    onClick={requestWithdraw}
    className="withdraw-btn"
    disabled={loading}
  >
    {loading ? "Processing..." : "Request Withdrawal"}
  </button>

</div> */}
      {/* ================= TRANSACTIONS ================= */}
      <div className="transactions-card">

        <h3>Transactions</h3>

        {!wallet?.transactions?.length ? (
          <p className="empty">No transactions yet</p>
        ) : (
          wallet.transactions.map((t, i) => (
            <div key={i} className="transaction">

              <div>
                <p className="type">{t.type}</p>
                <span className="date">
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="amount">
                {t.amount} EGP
              </p>

            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default Wallet;