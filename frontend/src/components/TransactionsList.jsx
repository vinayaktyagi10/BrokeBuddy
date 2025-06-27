import React, { useEffect, useState } from 'react';
import { getTransactions, categorizeTransactions } from '../api/transactions';

export default function TransactionsList() {
  const [txns, setTxns] = useState([]);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    getTransactions().then(res => {
      setTxns(res.data);
      categorizeTransactions(res.data).then(res2 => {
        setCategories(res2.data);
      });
    });
  }, []);

  return (
    <div className="transactions-list">
      <h2>🧾 Your Recent Transactions</h2>
      <table>
        <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Category</th><th>Action</th></tr></thead>
        <tbody>
          {txns.map(tx => (
            <tr key={tx.id}>
              <td>{tx.date}</td><td>{tx.desc}</td><td>₹{tx.amount}</td>
              <td>{categories[tx.id] || '...'}</td>
              <td>{categories[tx.id]==='Subscription' && (<button>Pause</button>)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
