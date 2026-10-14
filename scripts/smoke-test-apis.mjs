const symbols = ["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","LINKUSDT","AVAXUSDT","LTCUSDT","TRXUSDT","DOTUSDT"];
const providers = [
  {
    name: "Binance",
    url: "https://api.binance.com/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(symbols)),
    validate(data) {
      return Array.isArray(data) && data.length >= 5 && data.some(row => row.symbol === "BTCUSDT" && Number.isFinite(Number(row.lastPrice)));
    }
  },
  {
    name: "CoinGecko",
    url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&price_change_percentage=24h",
    validate(data) {
      return Array.isArray(data) && data.some(row => row.id === "bitcoin" && Number.isFinite(Number(row.current_price)));
    }
  }
];

const results = await Promise.all(providers.map(async provider => {
  try {
    const response = await fetch(provider.url, { signal: AbortSignal.timeout(12000), headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!provider.validate(data)) throw new Error("Response shape or sample quote is invalid");
    console.log(`PASS ${provider.name}: endpoint reachable and sample market data validated`);
    return true;
  } catch (error) {
    console.log(`WARN ${provider.name}: ${error.message}`);
    return false;
  }
}));

if (!results.some(Boolean)) {
  console.error("FAIL: both market-data providers are unavailable or returned invalid data.");
  process.exitCode = 1;
} else {
  console.log("PASS: at least one live market-data provider is usable from this runner.");
}
