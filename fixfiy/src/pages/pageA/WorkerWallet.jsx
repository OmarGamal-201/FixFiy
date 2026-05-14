import React, {
  useEffect,
  useState,
} from "react";

import API from "../../services/api";

import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock3,
} from "lucide-react";

import "./WorkerWallet.css";

export default function WorkerWallet() {

  const [wallet, setWallet] =
    useState(null);

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    withdrawAmount,
    setWithdrawAmount,
  ] = useState("");

  const [loading,
    setLoading] =
    useState(true);

  const [
    withdrawLoading,
    setWithdrawLoading,
  ] = useState(false);

  useEffect(() => {

    fetchWallet();

  }, []);

  const fetchWallet =
    async () => {

      try {

        setLoading(true);

        // wallet
        const walletRes =
          await API.get(
            "/wallet"
          );

        setWallet(
          walletRes.data.data
        );

        // transactions
        const txRes =
          await API.get(
            "/wallet/transactions"
          );

        setTransactions(
          txRes.data.data
            ?.transactions || []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  const handleWithdraw =
    async () => {

      if (
        !withdrawAmount ||
        Number(
          withdrawAmount
        ) <= 0
      ) {
        return alert(
          "Enter valid amount"
        );
      }

      try {

        setWithdrawLoading(
          true
        );

        await API.post(
          "/withdraw/request",
          {
            amount:
              withdrawAmount,
          }
        );

        alert(
          "Withdraw request submitted"
        );

        setWithdrawAmount(
          ""
        );

        fetchWallet();

      } catch (err) {

        console.log(err);

        alert(
          err.response?.data
            ?.message ||
            "Failed"
        );

      } finally {

        setWithdrawLoading(
          false
        );
      }
    };

  if (loading) {
    return (
      <div className="wallet-page">
        <h2>
          Loading wallet...
        </h2>
      </div>
    );
  }

  return (

    <div className="wallet-page">

      {/* HEADER */}

      <div className="wallet-header">

        <div>

          <h1>
            Wallet
          </h1>

          <p>
            Manage your earnings and withdrawals
          </p>

        </div>

        <div className="wallet-icon">

          <Wallet size={40} />

        </div>

      </div>

      {/* BALANCE CARD */}

      <div className="balance-card">

        <p>
          Current Balance
        </p>

        <h2>
          {wallet?.balance || 0}
          {" "}EGP
        </h2>

      </div>

      {/* WITHDRAW */}

      <div className="withdraw-card">

        <h3>
          Request Withdraw
        </h3>

        <div className="withdraw-form">

          <input
            type="number"
            placeholder="Enter amount"
            value={
              withdrawAmount
            }
            onChange={(e) =>
              setWithdrawAmount(
                e.target.value
              )
            }
          />

          <button
            onClick={
              handleWithdraw
            }
            disabled={
              withdrawLoading
            }
          >
            {
              withdrawLoading
                ? "Loading..."
                : "Withdraw"
            }
          </button>

        </div>

      </div>

      {/* TRANSACTIONS */}

      <div className="transactions-card">

        <h3>
          Transactions
        </h3>

        {transactions.length ===
        0 ? (

          <div className="empty-transactions">

            No transactions yet

          </div>

        ) : (

          <div className="transactions-list">

            {transactions.map(
              (tx) => (

                <div
                  key={tx._id}
                  className="transaction-item"
                >

                  <div className="tx-left">

                    <div
                      className={`tx-icon ${
                        tx.type ===
                        "EARNING"

                          ? "earning"

                          : "withdraw"
                      }`}
                    >

                      {tx.type ===
                      "EARNING"

                        ? (
                          <ArrowDownCircle
                            size={20}
                          />
                        )

                        : (
                          <ArrowUpCircle
                            size={20}
                          />
                        )}

                    </div>

                    <div>

                      <h4>
                        {tx.type}
                      </h4>

                      <p>

                        {new Date(
                          tx.createdAt
                        ).toLocaleDateString()}

                      </p>

                    </div>

                  </div>

                  <div
                    className={`tx-amount ${
                      tx.type ===
                      "EARNING"

                        ? "plus"

                        : "minus"
                    }`}
                  >

                    {tx.type ===
                    "EARNING"

                      ? "+"

                      : "-"}

                    {tx.amount}
                    {" "}EGP

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}