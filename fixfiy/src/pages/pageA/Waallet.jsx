

import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./wallett.css";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);

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

  return (
    <div className="wallet-page">

      <h2 className="title"> My Wallet</h2>

      {/* Balance Card */}
      <div className="balance-card">
        <p className="label">Current Balance</p>
        <h1 className="balance">
          {wallet?.balance || 0} EGP
        </h1>
      </div>

      {/* Transactions */}
      <div className="transactions-card">

        <h3> Transactions</h3>

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