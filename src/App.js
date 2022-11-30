import logo from './logo.svg';
import './App.css';
import { Wallet, providers } from 'ethers';
import { config } from './constants';
import { useEffect, useRef, useState } from 'react';
import { isAddress } from 'ethers/lib/utils';

const provider = new providers.StaticJsonRpcProvider(config.rpcUrl);
const wallet = new Wallet(config.privateKey).connect(provider)
const sendAmount = '100000000000000000';

function App() {
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [alreadyParticipated, setAlreadyParticipated] = useState(false);

  const recipientRef = useRef();

  useEffect(() => {
    recipientRef.current = address
  })

  const handleOnChange = ({ target: { value } }) => {
    setIsValidAddress(true)
    setAddress(value)
  }

  const sendTransaction = async () => {
    const _address = recipientRef.current;
    const isValid = isAddress(_address);


    if (!isValid) {
      setIsValidAddress(false)
      return;
    }

    let recipients;
    try {
      recipients = JSON.parse(localStorage.getItem('recipients')) || []
    } catch { }

    if (recipients.includes(_address)) {
      setAlreadyParticipated(true)
      return;
    }


    const tx = await wallet.sendTransaction({
      to: _address,
      value: sendAmount
    })

    recipients.push(_address)
    localStorage.setItem('recipients', JSON.stringify(recipients))

    setTxHash(tx.hash);

    await tx.wait();

    setSuccess(true)

    setTxHash('');

  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <p>Enter Address</p>
          <input onChange={handleOnChange} />
          <button disabled={!isValidAddress || alreadyParticipated} onClick={sendTransaction}>Send</button>
          {!isValidAddress && <p>Invalid Address</p>}
          {alreadyParticipated && <>Just one time</>}
          {txHash && <p>Transaction successfully submitted: {txHash}</p>}
          {success && <p>Transaction resolved</p>}
        </div>
      </header>
    </div>
  );
}

export default App;
