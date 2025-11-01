import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../config/prisma";

type Region = "ARS" | "BRL";

export interface QuoteDTO {
  buy_price: number;
  sell_price: number;
  source: string;
  timestamp?: string;
  spread?: number;
}

export class QuoteService {
  private readonly CACHE_TTL_MS = 60_000;

  private readonly endpoints: Record<Region, Record<string, string>> = {
    ARS: {
      ambito: "https://mercados.ambito.com/dolar/oficial/variacion",
      cronista: "https://www.cronista.com/MercadosOnline/moneda.html?id=ARS",
      dolarhoy: "https://dolarhoy.com/cotizaciondolaroficial",
    },
    BRL: {
      wise: "https://wise.com/gateway/v4/comparisons?sourceCurrency=BRL&targetCurrency=USD&sendAmount=1000&filter=POPULAR&includeWise=true&numberOfProviders=3",
      nubank: "https://nubank.com.br/dados-abertos/taxas-conversao",
      nomad: "https://www.nomadglobal.com/api/v1/exchange-rates/BRL/USD",
    },
  };

  private readonly PUBLIC_URLS: Record<Region, Record<string, string>> = {
    ARS: {
      ambito: "https://www.ambito.com/contenidos/dolar.html",
      dolarhoy: "https://www.dolarhoy.com",
      cronista: "https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB",
    },
    BRL: {
      wise: "https://wise.com/es/currency-converter/brl-to-usd-rate",
      nubank: "https://nubank.com.br/taxas-conversao/",
      nomad: "https://www.nomadglobal.com",
    },
  };

  async getQuotes(regionRaw: string): Promise<QuoteDTO[]> {
    const region = regionRaw.trim().toUpperCase() as Region;
    if (!["ARS", "BRL"].includes(region)) {
      console.error(`Invalid region: ${regionRaw}. Must be ARS or BRL.`);
      return [];
    }

    const latest = await prisma.quote.findFirst({
      where: { region },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const now = Date.now();
    const isFresh =
      latest && now - latest.createdAt.getTime() < this.CACHE_TTL_MS;

    if (isFresh) {
      return this.readFromDb(region);
    }

    const urls = this.endpoints[region];
    const fetched = await Promise.all(
      Object.entries(urls).map(([sourceKey, url]) =>
        this.fetchOne(url, sourceKey, region)
      )
    );

    const valid = fetched.filter(
      (q): q is QuoteDTO => q.buy_price > 0 && q.sell_price > 0
    );

    if (valid.length) {
      await Promise.all(
        valid.map((q) => {
          // 🧩 Validate timestamp before saving
          if (q.timestamp && isNaN(Date.parse(q.timestamp))) {
            console.warn(
              `⚠️ Invalid timestamp from ${q.source}: ${q.timestamp}`
            );
          }

          return prisma.quote.upsert({
            where: {
              region_source: {
                region,
                source: q.source,
              },
            },
            update: {
              buy_price: q.buy_price,
              sell_price: q.sell_price,
              spread: q.spread ?? null,
              timestamp:
                q.timestamp && !isNaN(Date.parse(q.timestamp))
                  ? new Date(q.timestamp)
                  : new Date(),
            },
            create: {
              region,
              source: q.source,
              buy_price: q.buy_price,
              sell_price: q.sell_price,
              spread: q.spread ?? null,
              timestamp:
                q.timestamp && !isNaN(Date.parse(q.timestamp))
                  ? new Date(q.timestamp)
                  : new Date(),
            },
          });
        })
      );
    }

    return valid;
  }

  private async readFromDb(region: Region): Promise<QuoteDTO[]> {
    const rows = await prisma.quote.findMany({
      where: { region },
      orderBy: { source: "asc" },
    });

    return rows.map((r: any) => ({
      buy_price: r.buy_price,
      sell_price: r.sell_price,
      source: r.source,
      timestamp: r.timestamp.toISOString(),
      spread: r.spread ?? undefined,
    }));
  }

  private async fetchOne(
    url: string,
    sourceKey: string,
    region: Region
  ): Promise<QuoteDTO> {
    try {
      if (url.includes("ambito.com"))
        return await this.fetchAmbito(url, sourceKey, region);
      if (url.includes("dolarhoy.com"))
        return await this.fetchDolarHoy(url, sourceKey, region);
      if (url.includes("cronista.com"))
        return await this.fetchCronista(url, sourceKey, region);
      if (url.includes("wise.com"))
        return await this.fetchWise(url, sourceKey, region);
      if (url.includes("nubank.com.br"))
        return await this.fetchNubank(url, sourceKey, region);
      if (url.includes("nomadglobal.com"))
        return await this.fetchNomad(url, sourceKey, region);

      throw new Error("Unsupported URL");
    } catch (err) {
      console.error(
        `Failed ${sourceKey} (internal: ${url}):`,
        err instanceof Error ? err.message : err
      );
      return {
        buy_price: 0,
        sell_price: 0,
        source: this.PUBLIC_URLS[region][sourceKey],
      };
    }
  }

  private buildQuote(
    buy: number,
    sell: number,
    sourceKey: string,
    region: Region,
    timestamp?: string,
    spread?: number
  ): QuoteDTO {
    return {
      buy_price: buy,
      sell_price: sell,
      source: this.PUBLIC_URLS[region][sourceKey],
      timestamp,
      spread,
    };
  }

  // ✅ FIXED AMBITO FUNCTION
  private async fetchAmbito(
    url: string,
    sourceKey: string,
    region: Region
  ): Promise<QuoteDTO> {
    interface AmbitoResp {
      compra?: string;
      venta?: string;
      fecha?: string;
    }

    const { data }: AxiosResponse<AmbitoResp> = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      timeout: 10_000,
    });

    const buy = this.cleanPrice(data.compra?.replace("$", ""));
    const sell = this.cleanPrice(data.venta?.replace("$", ""));
    const spread = buy > 0 ? (sell - buy) / buy : undefined;

    // 🧩 Validate & normalize fecha
    const timestamp =
      data.fecha && !isNaN(Date.parse(data.fecha))
        ? data.fecha
        : new Date().toISOString();

    return this.buildQuote(buy, sell, sourceKey, region, timestamp, spread);
  }

  // Other fetchers remain unchanged
  private async fetchDolarHoy(url: string, sourceKey: string, region: Region) {
    const { data } = await axios.get<string>(url, { timeout: 10_000 });
    const $ = cheerio.load(data);
    let buy = "",
      sell = "";
    $(".tile.is-parent.is-8 .tile.is-child").each((_i, el) => {
      const topic = $(el).find(".topic").text().trim().toLowerCase();
      const value = $(el).find(".value").text().trim();
      if (topic.includes("compra")) buy = value;
      if (topic.includes("venta")) sell = value;
    });
    const buy_price = this.cleanPrice(buy);
    const sell_price = this.cleanPrice(sell);
    const spread =
      buy_price > 0 ? (sell_price - buy_price) / buy_price : undefined;
    return this.buildQuote(
      buy_price,
      sell_price,
      sourceKey,
      region,
      undefined,
      spread
    );
  }

  private async fetchCronista(url: string, sourceKey: string, region: Region) {
    const { data } = await axios.get<string>(url, { timeout: 10_000 });
    const $ = cheerio.load(data);
    const buyTxt = $("span.buy").text().trim();
    const sellTxt = $("span.sell").text().trim();
    const buy_price = this.cleanPrice(buyTxt.split("$")[1]);
    const sell_price = this.cleanPrice(sellTxt.split("$")[1]);
    const spread =
      buy_price > 0 ? (sell_price - buy_price) / buy_price : undefined;
    return this.buildQuote(
      buy_price,
      sell_price,
      sourceKey,
      region,
      undefined,
      spread
    );
  }

  private async fetchWise(url: string, sourceKey: string, region: Region) {
    interface WiseProvider {
      alias: string;
      quotes?: Array<{ rate?: number }>;
    }
    interface WiseResp {
      providers?: WiseProvider[];
    }
    const { data }: AxiosResponse<WiseResp> = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      timeout: 10_000,
    });
    const wiseProvider = data.providers?.find((p) => p.alias === "wise");
    const rate = wiseProvider?.quotes?.[0]?.rate;
    if (!rate) throw new Error("Rate not found");
    const spread = 0.005;
    const buy_price = rate * (1 - spread);
    const sell_price = rate * (1 + spread);
    return this.buildQuote(
      parseFloat(buy_price.toFixed(6)),
      parseFloat(sell_price.toFixed(6)),
      sourceKey,
      region,
      undefined,
      spread
    );
  }

  private async fetchNubank(url: string, sourceKey: string, region: Region) {
    const { data } = await axios.get<string>(url, { timeout: 10_000 });
    const $ = cheerio.load(data);
    const valueText = $("tbody tr").first().find("td").eq(1).text().trim();
    const midRate = parseFloat(
      valueText.replace(/[^\d.,]/g, "").replace(",", ".")
    );
    if (isNaN(midRate))
      return {
        buy_price: 0,
        sell_price: 0,
        source: this.PUBLIC_URLS[region][sourceKey],
      };
    const spread = 0.005;
    const buy_price = midRate * (1 - spread);
    const sell_price = midRate * (1 + spread);
    return this.buildQuote(
      buy_price,
      sell_price,
      sourceKey,
      region,
      undefined,
      spread
    );
  }

  private async fetchNomad(url: string, sourceKey: string, region: Region) {
    interface NomadResp {
      rate?: number;
      exchange_rate?: number;
    }
    const { data }: AxiosResponse<NomadResp> = await axios.get(url, {
      headers: { Accept: "application/json" },
      timeout: 10_000,
    });
    const rate = data.rate ?? data.exchange_rate;
    if (!rate) throw new Error("Rate missing");
    const spread = 0.01;
    const buy_price = rate * (1 - spread);
    const sell_price = rate * (1 + spread);
    return this.buildQuote(
      buy_price,
      sell_price,
      sourceKey,
      region,
      undefined,
      spread
    );
  }

  private cleanPrice(str: string | undefined): number {
    if (!str) return 0;
    return parseFloat(str.replace(/[$.]/g, "").replace(",", ".").trim()) || 0;
  }
}

const QuoteServices = new QuoteService();
export default QuoteServices;
