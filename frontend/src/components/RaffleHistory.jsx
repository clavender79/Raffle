const RaffleHistory = ({ history = [] }) => {
    if (history.length === 0) {
      return (
        <div className="raffle-history-card">
          <h2>Raffle History</h2>
          <p className="no-history">No previous raffles found.</p>
        </div>
      )
    }
  
    return (
      <div className="raffle-history-card">
        <h2>Raffle History</h2>
        <div className="history-list">
          {history.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-date">{item.date}</div>
              <div className="history-winner">
                <span>Winner:</span> {item.winner}
              </div>
              <div className="history-amount">
                <span>Prize:</span> {item.amount} ETH
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default RaffleHistory
  