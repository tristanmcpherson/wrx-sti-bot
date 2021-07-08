import JsonFileManager from "./jsonFileManager";

export type Author = {
    id: string,
    username: string,
    discriminator: string,
};
type QuoteData = {
    guildId: string,
    channelId: string,
    messages: {
        id: string,
        content: string,
        authorId: string,
    }[],
    authors: Author[],
    createdAt: number,
};
export type Quote = {
    id: number,
} & QuoteData;

type QuotesDb = {
    quotes: Quotes,
    version: number,
    cleanStart: boolean,
};

const defaultQuotesDb = {
    quotes: [],
    version: 3,
    cleanStart: false,
};

export type Quotes = Quote[];

const getRandomArbitrary = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

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

class QuoteManager {
    fileManager: JsonFileManager<QuotesDb>;
    removedQuotesFileManager: JsonFileManager<QuotesDb>;
    latestQuoteId: number = 0;
    shuffledQuoteIndices: number[] = [];
    currentShuffledQuoteIndex: number = 0;
    hasShuffledQuoteIndices: boolean = false;

    constructor() {
        this.fileManager = new JsonFileManager("quotes", defaultQuotesDb)
        this.removedQuotesFileManager = new JsonFileManager("removedQuotes", defaultQuotesDb);
    }

    _populateShuffledQuoteIndices(quotes: Quote[]) {
        this.shuffledQuoteIndices = shuffle(quotes.map((quote, index) => index));
        this.hasShuffledQuoteIndices = true;
    }

    async _handleNewDbVersion(oldQuotesDb: QuotesDb, oldRemovedQuotesDb: QuotesDb): Promise<QuotesDb> {
        await this.fileManager.renameOldFile(`quotes.${oldQuotesDb.version || 1}`);

        let newQuotesDb;

        if (defaultQuotesDb.cleanStart) {
            newQuotesDb = await this.fileManager.load();
        } else {
            newQuotesDb = {
                ...defaultQuotesDb,
                quotes: [...oldQuotesDb.quotes],
            }
            await this.fileManager.save(newQuotesDb);
        }

        if (oldRemovedQuotesDb.version === oldQuotesDb.version) {
            await this.removedQuotesFileManager.renameOldFile(`removedQuotes.${oldRemovedQuotesDb.version || 1}`);
            await this.removedQuotesFileManager.load();
        }
        
        return newQuotesDb;
    }

    async _loadQuotesDb(): Promise<QuotesDb> {
        let quotesDb = await this.fileManager.load();
        let removedQuotesDb = await this.removedQuotesFileManager.load();

        if (quotesDb.version !== defaultQuotesDb.version) {
            quotesDb = await this._handleNewDbVersion(quotesDb, removedQuotesDb);
        }
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

        const indexToInsertAt = getRandomArbitrary(0, this.shuffledQuoteIndices.length + 1);
        this.shuffledQuoteIndices.splice(indexToInsertAt, 0, quotesDb.quotes.length - 1);
        if (this.currentShuffledQuoteIndex >= indexToInsertAt) {
            this._advanceShuffledQuoteIndex(this.shuffledQuoteIndices.length);
        }

        return quote;
    }

    _advanceShuffledQuoteIndex(shuffledQuotesCount: number): void {
        this.currentShuffledQuoteIndex = (this.currentShuffledQuoteIndex + 1) % shuffledQuotesCount;
    }

    _backtrackShuffledQuoteIndex(shuffledQuotesCount: number): void {
        this.currentShuffledQuoteIndex--;
        if (this.currentShuffledQuoteIndex < 0) {
            this.currentShuffledQuoteIndex = 0;
        }
    }

    async remove(quoteId: number): Promise<Quote> {
        const quotesDb = await this._loadQuotesDb();
        const indexToRemove = quotesDb.quotes.findIndex(quote => quote.id === quoteId);

        if (indexToRemove === -1) {
            throw new Error(`Attempted to remove quote with id ${quoteId}, but it doesn't exist`)
        }

        const quoteToRemove = quotesDb.quotes[indexToRemove];
        quotesDb.quotes.splice(indexToRemove, 1);

        const removedIndex = indexToRemove;
        const removedQuote = quoteToRemove;

        await this.fileManager.save(quotesDb);

        const indexOfRemovedQuoteIndexInShuffledQuoteIndices = this.shuffledQuoteIndices.findIndex((index) => index === removedIndex);
        // remove index
        this.shuffledQuoteIndices.splice(indexOfRemovedQuoteIndexInShuffledQuoteIndices, 1);
        // decrement indices greater than index
        this.shuffledQuoteIndices = this.shuffledQuoteIndices.map(index => index > removedIndex ? index - 1 : index);
        // update current shuffled quote index
        if (this.currentShuffledQuoteIndex > indexOfRemovedQuoteIndexInShuffledQuoteIndices) {
            this.currentShuffledQuoteIndex--;
        }

        const removedQuotesDb = await this.removedQuotesFileManager.load();
        removedQuotesDb.quotes.push(removedQuote);
        await this.removedQuotesFileManager.save(removedQuotesDb);

        return removedQuote;
    }

    async getRandomQuote(): Promise<Quote | null> {
        const quotes = await this.load();

        if (quotes.length === 0) {
            return null;
        }

        const quote = quotes[this.shuffledQuoteIndices[this.currentShuffledQuoteIndex]];

        this._advanceShuffledQuoteIndex(quotes.length);

        return quote;
    }

    async getQuote(quoteId: number): Promise<Quote | null> {
        const quotes = await this.load();
        const quote = quotes.find(quote => quote.id === quoteId) || null;
        return quote;
    }

    async getQuoteCount(): Promise<number> {
        const quotes = await this.load();
        return quotes.length;
    }
}

export default new QuoteManager();
