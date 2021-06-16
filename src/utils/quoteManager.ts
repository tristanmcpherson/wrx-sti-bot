import JsonFileManager from "./jsonFileManager"

type QuoteData = {
    guildId: string,
    channelId: string,
    authors: {
        id: string,
        username: string,
        discriminator: string,
    }[],
    content: string,
    createdAt: number,
    messageIds: string[],
};
export type Quote = {
    id: number,
} & QuoteData;

type QuotesDb = {
    quotes: Quotes,
};

const defaultQuotesDb = {
    quotes: [],
};

export type Quotes = Quote[];

const getRandomArbitrary = (min: number, max: number) => Math.random() * (max - min) + min;

const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = 0; i < array.length - 1; i++) {
        const indexToSwapWith = getRandomArbitrary(i + 1, array.length);
        const temp = newArray[i];
        newArray[i] = newArray[indexToSwapWith];
        newArray[indexToSwapWith] = temp;
    }
    return newArray;
};

const quoteIdToIndex = (quoteId: number): number => quoteId - 1;

class QuoteManager {
    fileManager: JsonFileManager<QuotesDb>;
    latestQuoteId: number = 0;
    shuffledQuoteIndices: number[] = [];
    currentShuffledQuoteIndex: number = 0;
    hasShuffledQuoteIndices: boolean = false;

    constructor() {
        this.fileManager = new JsonFileManager("quotes", defaultQuotesDb)
    }

    _populateShuffledQuoteIndices(quotes: Quote[]) {
        this.shuffledQuoteIndices = shuffle(quotes.map(quote => quoteIdToIndex(quote.id)));
        this.hasShuffledQuoteIndices = true;
    }

    async _loadQuotesDb(): Promise<QuotesDb> {
        const quotesDb = await this.fileManager.load();
        if (quotesDb.quotes.length > 0) {
            this.latestQuoteId = quotesDb.quotes[quotesDb.quotes.length - 1].id;
        }
        if (!this.hasShuffledQuoteIndices) {
            this._populateShuffledQuoteIndices(quotesDb.quotes);
        }
        return quotesDb;
    }

    async load(): Promise<Quotes> {
        return (await this._loadQuotesDb()).quotes;
    }

    async save(quoteData: QuoteData): Promise<Quote> {
        const quotesDb = await this._loadQuotesDb();
        const quote = {
            id: this.latestQuoteId + 1,
            ...quoteData,
        };
        this.latestQuoteId = quote.id;
        quotesDb.quotes.push(quote);
        await this.fileManager.save(quotesDb);
        this.shuffledQuoteIndices.push(quoteIdToIndex(quote.id))
        return quote;
    }

    async getRandomQuote(): Promise<Quote | null> {
        const quotes = await this.load();

        if (quotes.length === 0) {
            return null;
        }

        const quote = quotes[this.currentShuffledQuoteIndex];

        this.currentShuffledQuoteIndex = (this.currentShuffledQuoteIndex + 1) % quotes.length;

        return quote;
    }

    async getQuote(quoteId: number): Promise<Quote | null> {
        const quotes = await this.load();
        const quoteIndex = quoteIdToIndex(quoteId);

        if (quoteIndex < 0 || quoteIndex >= quotes.length) {
            return null;
        }

        return quotes[quoteIndex];
    }
}

export default new QuoteManager();
