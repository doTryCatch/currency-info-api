// QuoteService.ts
import axios from "axios";
// import * as cheerio from "cheerio";
import NodeCache from "node-cache";

interface Quote {
  buy_price: number;
  sell_price: number;
  source: string;
  type?: string;
  timestamp?: string;
}

const cache = new NodeCache({ stdTTL: 60, checkperiod: 10 });

export class QuoteService {
  async getQuotes(region: "ARS" | "BRL"): Promise<Quote[]> {
    const cacheKey = `quotes_${region}`;
    const cached = cache.get<Quote[]>(cacheKey);
    if (cached) return cached;

    const urls = region === "BRL" ? this.brlUrls : this.arsUrls;
    const quotes = await Promise.all(urls.map((u) => this.fetchOne(u, region)));
    const valid = quotes.filter((q) => q.buy_price > 0 && q.sell_price > 0);
    cache.set(cacheKey, valid);
    console.log(quotes);
    return valid;
  }
  //   private arsApiPoins = {
  //     ambito: "https://mercados.ambito.com/dolar/official/variacion",
  //     cronista: "https://api.cronista.com/markets/dolar/ARS/variacion",
  //     dolarhoy: "https://www.dolarhoy.com/api/dolarblue",
  //   };
  private arsUrls = [
    "https://www.ambito.com/contenidos/dolar.html",
    "https://www.dolarhoy.com",
    "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB",
  ];

  private brlUrls = [
    "https://wise.com/es/currency-converter/brl-to-usd-rate",
    "https://nubank.com.br/taxas-conversao/",
    "https://www.nomadglobal.com",
  ];

  private async fetchOne(url: string, region: "ARS" | "BRL"): Promise<Quote> {
    try {
      const { data } = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; QuoteBot/1.0)" },
      });
      console.log(data);
      console.log(region);

      //   if (region === "ARS") {
      //     if (url.includes("ambito.com")) return this.parseAmbitoApi(data, url);
      //     if (url.includes("cronista.com"))
      //       return this.parseCronistaApi(data, url);
      //     if (url.includes("dolarhoy.com"))
      //       return this.parseDolarHoyHtml(data, url);
      //   }

      //   if (region === "BRL") {
      //     if (url.includes("wise.com")) return this.parseWiseApi(data, url);
      //     if (url.includes("nubank.com.br"))
      //       return this.parseNubankHtml(data, url);
      //     if (url.includes("nomadglobal.com"))
      //       return this.parseNomadHtml(data, url);
      //   }

      return { buy_price: 0, sell_price: 0, source: url };
    } catch {
      return { buy_price: 0, sell_price: 0, source: url };
    }
  }

  //   private parseAmbitoApi(data: any, source: string): Quote {
  //     const clean = (s: string) =>
  //       parseFloat(s.replace(/\./g, "").replace(",", "."));
  //     return {
  //       buy_price: clean(data.compra),
  //       sell_price: clean(data.venta),
  //       source,
  //       type: "Dólar Blue",
  //       timestamp: data.fecha,
  //     };
  //   }
}

const QuoteServices = new QuoteService();
export default QuoteServices;
