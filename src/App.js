import React, { useState, useEffect } from 'react';
import './App.css'; 

function App() {
  const [pricesData, setPricesData] = useState({});
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [previousPrices, setPreviousPrices] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [perPage] = useState(10);
  const [bidComparison, setBidComparison] = useState('');
  const [askComparison, setAskComparison] = useState('');

  useEffect(() => {
    const newSocket = new WebSocket('wss://wssx.gntapi.com:443');

    newSocket.onopen = () => {
      console.log('Conexión WebSocket establecida.');
      newSocket.send('prices');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Datos recibidos del WebSocket:', data);
      setPricesData(data.prices);
    };

    newSocket.onerror = (error) => {
      console.error('Error de conexión WebSocket:', error);
    };

    newSocket.onclose = () => {
      console.log('Conexión WebSocket cerrada.');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    localStorage.removeItem('selectedPrice');
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPageNumber(1); 
  };

  const handleCurrencySelection = (currency) => {
    const storedPrice = JSON.parse(localStorage.getItem('selectedPrice')) || {};

    if (storedPrice && Object.keys(storedPrice).length > 0) {
      comparePrices(pricesData[currency], storedPrice);
    }

    localStorage.setItem('selectedPrice', JSON.stringify(pricesData[currency]));
    setSelectedCurrency(currency);
  };

  const comparePrices = (currentPrice, storedPrice) => {
    const currentBid = parseFloat(currentPrice.bid);
    const currentAsk = parseFloat(currentPrice.ask);
    const storedBid = parseFloat(storedPrice.bid);
    const storedAsk = parseFloat(storedPrice.ask);


    let bidComparisonValue = '';
    if (currentBid > storedBid) {
      bidComparisonValue = 'green';
    } else if (currentBid < storedBid) {
      bidComparisonValue = 'red';
    }
    setBidComparison(bidComparisonValue);


    let askComparisonValue = '';
    if (currentAsk > storedAsk) {
      askComparisonValue = 'green';
    } else if (currentAsk < storedAsk) {
      askComparisonValue = 'red';
    }
    setAskComparison(askComparisonValue);

  };

  useEffect(() => {
    if (selectedCurrency && pricesData[selectedCurrency]) {
      const { bid, ask } = pricesData[selectedCurrency];
      localStorage.setItem(selectedCurrency, JSON.stringify({ bid, ask }));
    }
  }, [selectedCurrency, pricesData]);

  const filteredCurrencies = Object.keys(pricesData).filter(currency =>
    currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startIndex = (pageNumber - 1) * perPage;
  const endIndex = pageNumber * perPage;
  const totalPages = Math.ceil(filteredCurrencies.length / perPage);

  const paginatedCurrencies = filteredCurrencies.slice(startIndex, endIndex);

  return (
    <div className="container"> 
      <h1>Datos de Precios</h1>
      <input
        type="text"
        placeholder="Buscar divisa..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <table>
        <thead>
          <tr>
            <th>Divisa</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCurrencies.map(currency => (
            <tr
              key={currency}
              onClick={() => handleCurrencySelection(currency)}
              className="currency-row selectable" 
            >
              <td>{currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedCurrency && (
        <div>
          <h2>Precios para {selectedCurrency}</h2>
          <p style={{ color: bidComparison }}>{`Bid: ${pricesData[selectedCurrency].bid}`}</p>
          <p style={{ color: askComparison }}>{`Ask: ${pricesData[selectedCurrency].ask}`}</p>
        </div>
      )}
      <div className="pagination">
        <button onClick={() => setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1))} disabled={pageNumber === 1}>Anterior</button>
        <span>{` Página ${pageNumber} de ${totalPages} `}</span>
        <button onClick={() => setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, totalPages))} disabled={pageNumber === totalPages}>Siguiente</button>
      </div>
    </div>
  );
}

export default App;














