const About = () => {
    return (
      <div className="about-page">
        <h1>About CryptoRaffleDApp</h1>
  
        <div className="about-section">
          <h2>How It Works</h2>
          <p>
            CryptoRaffleDApp is a decentralized lottery system built on the Ethereum blockchain. Players can enter the
            raffle by paying a small entrance fee. Once the raffle closes, a winner is randomly selected using Chainlink
            VRF (Verifiable Random Function) to ensure fair and transparent selection.
          </p>
        </div>
  
        <div className="about-section">
          <h2>Smart Contract</h2>
          <p>
            Our smart contract is fully audited and secure. The code is open-source and can be viewed on Etherscan. We use
            Chainlink VRF for randomness and Chainlink Keepers for automated draws.
          </p>
          <div className="contract-details">
            <p>
              <span>Contract Address:</span> 0x1234...5678
            </p>
            <p>
              <span>Network:</span> Ethereum Mainnet
            </p>
            <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="etherscan-link">
              View on Etherscan
            </a>
          </div>
        </div>
  
        <div className="about-section">
          <h2>Rules</h2>
          <ul className="rules-list">
            <li>Each player can enter multiple times to increase their chances of winning.</li>
            <li>The entrance fee is fixed for each raffle.</li>
            <li>The winner receives the entire contract balance minus a small fee for operations.</li>
            <li>Draws occur automatically when the timer reaches zero or when a minimum number of players is reached.</li>
          </ul>
        </div>
      </div>
    )
  }
  
  export default About
  