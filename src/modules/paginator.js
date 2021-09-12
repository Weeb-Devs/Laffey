const EMOJIS = { first: '⏪', prev: '◀️', stop: '🇽', next: '▶️', last: '⏩' };

class Paginator {
    constructor(pages = [], { filter, timeout } = { timeout: 5 * 6e4 }) {
        this.pages = Array.isArray(pages) ? pages : [];
        this.filter = typeof filter === 'function'
            ? (reaction, user) => filter(reaction, user) && !user.bot && Object.values(EMOJIS).includes(reaction.emoji.name)
            : (reaction, user) => Object.values(EMOJIS).includes(reaction.emoji.name) && !user.bot;
        this.timeout = Number(timeout) || 5 * 6e4;
        this.page = 0;
    }

    add(page) {
        this.pages.push(page);
        return this;
    }

    setEndPage(page) {
        if (page) this.endPage = page;
        return this;
    }

    setTransform(fn) {
        const _pages = [];
        let i = 0;
        const ln = this.pages.length;
        for (const page of this.pages) {
            _pages.push(fn(page, i, ln));
            i++;
        }
        this.pages = _pages;
        return this;
    }

    async start(channel) {
        if (!this.pages.length) return;
        const message = await channel.send(this.pages[0]);
        for (const emoji of Object.values(EMOJIS)) {
            if (message.deleted) return message.reactions.removeAll().catch((_) => { })
            await message.react(emoji);
        }
        const collector = message.createReactionCollector(this.filter, { time: this.timeout });

        collector.on('collect', (reaction, user) => {
            switch (reaction.emoji.name) {
                case EMOJIS.first:
                    message.edit(this.pages[0]);
                    this.page = 0;
                    break;
                case EMOJIS.prev:
                    if (this.pages[this.page - 1]) message.edit(this.pages[--this.page]);
                    break;
                case EMOJIS.stop:
                    message.reactions.removeAll().catch((_) => { })
                    collector.stop();
                    message.delete({ timeout: 500 });
                    break;
                case EMOJIS.next:
                    if (this.pages[this.page + 1]) message.edit(this.pages[++this.page]);
                    break;
                case EMOJIS.last:
                    message.edit(this.pages[this.pages.length - 1]);
                    this.page = this.pages.length - 1;
            }

            try {
                if (!message.deleted) {
                    reaction.users.remove(user.id).catch((_) => { })
                }
            } catch (err) {
                console.log('blabla')
            }

        });

        collector.on('end', () => {
            try {
                if (!message.deleted) {
                    if (this.endPage) message.edit(this.endPage);
                    message.reactions.removeAll().catch((_) => { })
                }
            } catch (err) {
                console.log('blabla')
            }
        });
    }
}

module.exports = Paginator;
