export class Utils {
    static isLink(text: string): boolean {
        return text.match(/(https?:\/\/[^\s]+)/g) !== null;
    }

    static chunkArray<T>(arr: T[] = [], size = 10) {
        let chunks = []
        for (let i = 0; i < arr.length; i += size) {
            const chunk = arr.slice(i, i + size);
            chunks.push(chunk);
        }
        return chunks;
    }
}