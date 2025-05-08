const RaffleDetails = ({ entranceFee, players, contractBalance, lastWinner }) => {
    return (
      <div className="raffle-details-card">
        <h2>Raffle Details</h2>
        <div className="raffle-details-content">
          <div className="raffle-details-left">
            <p>
              <span>Entrance Fee:</span> {entranceFee} ETH
            </p>
            <p>
              <span>Players:</span> {players}
            </p>
          </div>
          <div className="raffle-details-right">
            <p>
              <span>Contract Balance:</span> {contractBalance} ETH
            </p>
            <p>
              <span>Last Winner:</span> {lastWinner}
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  export default RaffleDetails
  