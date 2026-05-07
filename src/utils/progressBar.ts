type ProgressBarStyle = 'block' | 'dotted';

export class ProgressBar {
    private static bars = new Map<ProgressBarStyle, [string, string, string]>([
        ['block', ['█', '▒', '░']],
        ['dotted', ['⣿', '⣦', '⣀']],
    ]);

    public static make(current: number, max: number, length = 20, style: ProgressBarStyle = 'block'): string {
        if (max <= 0) return this.renderEmpty(length, style);

        const ratio = Math.max(0, Math.min(1, current / max));
        const exact = ratio * length;

        const full = Math.floor(exact);
        const hasPartial = exact % 1 >= 0.5 ? 1 : 0;

        const [filledChar, partialChar, emptyChar] =
        this.bars.get(style) ?? this.bars.get('block')!;

        const empty = Math.max(0, length - full - hasPartial);

        return (
            filledChar.repeat(full) +
            (hasPartial ? partialChar : '') +
            emptyChar.repeat(empty)
        );
    }

    private static renderEmpty(length: number, style: ProgressBarStyle): string {
        const [, , emptyChar] = this.bars.get(style) ?? this.bars.get('block')!;
        return emptyChar.repeat(length);
    }
}