import sharp from "sharp";

export class Sharp {
    static async getPaletteFromUrl(url: string, {
        colorCount = 5,
        resize = 150,
        sample = 8,
        whiteThreshold = 245,
        alphaThreshold = 128,
    } = {}) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

        const input = Buffer.from(await res.arrayBuffer());

        const {data, info} = await sharp(input)
            .rotate()
            .resize({width: resize, height: resize, fit: "inside", withoutEnlargement: true})
            .ensureAlpha()
            .raw()
            .toBuffer({resolveWithObject: true});

        const bins = new Map();

        for (let i = 0; i < data.length; i += info.channels * sample) {
            const r = data[i]!;
            const g = data[i + 1]!;
            const b = data[i + 2]!;
            const a = data[i + 3]!;

            if (a < alphaThreshold) continue;
            if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) continue;

            const qr = r >> 4;
            const qg = g >> 4;
            const qb = b >> 4;
            const key = (qr << 8) | (qg << 4) | qb;

            let item = bins.get(key);
            if (!item) {
                item = {count: 0, rSum: 0, gSum: 0, bSum: 0};
                bins.set(key, item);
            }

            item.count++;
            item.rSum += r;
            item.gSum += g;
            item.bSum += b;
        }

        return [...bins.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, colorCount)
            .map((x) => {
                const r = Math.round(x.rSum / x.count);
                const g = Math.round(x.gSum / x.count);
                const b = Math.round(x.bSum / x.count);
                const hex = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
                return {rgb: [r, g, b], hex, count: x.count} as {
                    rgb: [number, number, number],
                    hex: string,
                    count: number
                };
            });
    }
}