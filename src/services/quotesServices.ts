interface Quote {
  buy_price: number;
  sell_price: number;
  source: string;
}
class QuoteService {
  parseInfo(info: string) {
    //parsing logic for different sources
    console.log(info);
    return { buy: 0, sell: 0 };
  }
  async getQuotes(region: string) {
    const urls =
      region === "BLR"
        ? [
            "https://wise.com/es/currency-converter/brl-to-usd-rate",
            "https://nubank.com.br/taxas-conversao/",
            "https://www.nomadglobal.com",
          ]
        : [
            "https://www.ambito.com/contenidos/dolar.html",
            "https://www.dolarhoy.com",
            "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB",
          ];
    const fetchPromises = urls.map(async (url) => {
      const response = await fetch(url);
      const info = await response.text();
      const { buy, sell } = this.parseInfo(info);

      return {
        buy_price: buy,
        sell_price: sell,
        source: url,
      } as Quote;
    });
    const data = Promise.all(fetchPromises);
    return data;
    //api request to sources from
  }
}
const QuoteServices = new QuoteService();
export default QuoteServices;
