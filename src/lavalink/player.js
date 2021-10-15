const { Structure, TrackUtils } = require('erela.js');

module.exports = Structure.extend('Player', player => {
    class laffeyPlayer extends player {
        constructor(...args) {
            super(...args)
            this.speed = 1;
            this.speed = 1;
            this.rate = 1;
            this.pitch = 1;
            this.bassboost = false;
            this.nightcore = false;
            this.vaporwave = false;
            this._8d = false;
        }

        setSpeed(speed) {
            if (isNaN(speed)) throw new RangeError('<Player>#setSpeed() must be a number.')
            this.speed = Math.max(Math.min(speed, 5), 0.05)
            this.setTimescale(speed, this.pitch, this.rate)
            return this;
        }

        setPitch(pitch) {
            if (isNaN(pitch)) throw new RangeError("<Player>#setPitch() must be a number.");
            this.pitch = Math.max(Math.min(pitch, 5), 0.05);
            this.setTimescale(this.speed, pitch, this.rate)
            return this;
        }

        setNightcore(nc) {
            if (typeof nc !== "boolean") throw new RangeError('<Player>#setNighcore() must be a boolean.');

            if (nc) {
                this.bassboost = false;
                this.distortion = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.setBassboost(false)
                this.setDistortion(false)
                this.setTimescale(1.2999999523162842, 1.2999999523162842, 1);
                this.nightcore = nc;
            } else this.setTimescale(1, 1, 1);
            this.nightcore = nc;
            return this;
        }

        setVaporwave(vaporwave) {
            if (typeof vaporwave !== "boolean") throw new RangeError('<Player>#setVaporwave() must be a boolean.');

            if (vaporwave) {
                this.nightcore = false;
                this.bassboost = false;
                this.distortion = false;
                this.setBassboost(false)
                this.setNightcore(false)
                this.setDistortion(false)
                this.setTimescale(0.8500000238418579, 0.800000011920929, 1);
                this.vaporwave = vaporwave;
            } else this.setTimescale(1, 1, 1);
            this.vaporwave = vaporwave;
            return this;
        }

        setDistortion(distortion) {
            if (typeof distortion !== "boolean") throw new RangeError('<Player>#setDistortion() must be a boolean.');

            if (distortion) {
                this.nightcore = false;
                this.vaporwave = false;
                this.bassboost = false;
                this.setBassboost(false)
                this.setNightcore(false)
                this.setVaporwave(false)
                this.setDistort(0.5)
                this.distortion = distortion;
            } else this.clearEffects();
            this.distortion = distortion;
            return this;
        }

        setBassboost(bassboost) {

            if (bassboost) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.setNightcore(false)
                this.setEQ(...Array.from({ length: 3 }, () => {
                    return { band: 1, gain: bassboost }; // this is so nodejs can differentiate which { is for arrow function and which one is for objects
                });
                this.bassboost = bassboost;
            } else this.clearEffects();
            this.bassboost = bassboost;
            return this;
        }

        set8D(sd) {
            if (typeof sd !== 'boolean') throw new RangeError('<Player>#set8D() must be a boolean.')
            if (sd) {
                this.nightcore = false;
                this.vaporwave = false;
                this.setVaporwave(false)
                this.setNightcore(false)
                this.node.send({
                    op: "filters",
                    guildId: this.guild,
                    rotation: {
                        rotationHz: 0.2,
                    }
                })
                this._8d = sd
            } else this.clearEffects()
            this._8d = sd
            return this
        }

        async toggleLoop() {
            if (!this.queueRepeat && !this.trackRepeat) {
                await this.setTrackRepeat(true)
                return { player: this, status: 'track' }
            } else if (this.trackRepeat) {
                await this.setQueueRepeat(true)
                return { player: this, status: 'queue' }
            } else if (this.queueRepeat) {
                await this.setQueueRepeat(false)
                return { player: this, status: 'none' }
            }
        }

        async skip() {
            if (this.queue.length === 0) throw new Error('Queue is empty to skip')
            const current = this.queue.current
            this.play(this.queue[0])
            if (this.queueRepeat) {
                const track = TrackUtils.build({
                    track: current.track || null,
                    info: {
                        title: current.title || null,
                        identifier: current.identifier || null,
                        author: current.author || null,
                        length: current.duration || 1,
                        isSeekable: current.isSeekable,
                        isStream: current.isStream,
                        uri: current.uri || null,
                        thumbnail: current.thumbnail || null,
                    }
                }, current.requester)
                this.queue.add(track);
                this.queue.shift();
            } else this.queue.shift();
            return this;
        }

        async skipto(target) {
            if (typeof target !== 'number') throw new RangeError('<Player>#skipto() must be a number.')
            if (this.queue.length === 0) throw new Error('Queue is empty to skip')
            if (target > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
            const current = this.queue.current;
            this.play(this.queue[parseInt(`${target}`) - 1])
            if (this.queueRepeat) {
                const track = TrackUtils.build({
                    track: current.track || null,
                    info: {
                        title: current.title || null,
                        identifier: current.identifier || null,
                        author: current.author || null,
                        length: current.duration || 1,
                        isSeekable: current.isSeekable,
                        isStream: current.isStream,
                        uri: current.uri || null,
                        thumbnail: current.thumbnail || null,
                    }
                }, current.requester)
                this.queue.add(track)
                for (let i = 0; i < parseInt(`${target}`) - 1; i++) {
                    this.queue.push(this.queue.shift());
                }
                this.queue.shift()
            } else {
                for (let i = 0; i < parseInt(`${target}`); i++) {
                    this.queue.shift()
                }
            }
            return this;
        }

        async move(first, second) {
            if (typeof first !== 'number') throw new RangeError('<Player>#move() first must be a number.')

            if (first && !second) {
                if ((parseInt(`${first}`) - 1) > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
                this.array_move(this.queue, parseInt(`${first}`) - 1, 0)
                return this;
            } else {
                if (typeof second !== 'number') throw new RangeError('<Player>#move() second must be a number.')
                if ((parseInt(`${first}`) - 1) > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
                if ((parseInt(`${second}`) - 1) > this.queue.size) throw new Error('There\'s only ' + this.queue.size + ' songs in queue.')
                this.array_move(this.queue, parseInt(`${first}`) - 1, parseInt(`${second}`) - 1)
                return this;

            }
        }

        setDistort(value) {
            this.value = value || this.value;

            this.node.send({
                op: "filters",
                guildId: this.guild,
                distortion: {
                    distortion: this.value
                }
            });
            return this
        }

        setTimescale(speed, pitch, rate) {
            this.speed = speed || this.speed;
            this.pitch = pitch || this.pitch;
            this.rate = rate || this.rate;

            this.node.send({
                op: "filters",
                guildId: this.guild,
                timescale: {
                    speed: this.speed,
                    pitch: this.pitch,
                    rate: this.rate
                },
            });
            return this;
        }

        clearEffects() {
            this.speed = 1;
            this.pitch = 1;
            this.rate = 1;
            this._8d = false;
            this.bassboost = false;
            this.nightcore = false;
            this.vaporwave = false;
            this.distortion = false;
            this.clearEQ();

            this.node.send({
                op: "filters",
                guildId: this.guild
            });
            return this;
        }

        array_move(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        }
    }
    return laffeyPlayer;
})
