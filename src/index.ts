import Redis from 'ioredis';


interface Message {
    createdAt: Date;
    data: any;
}



class EventBus {
    private publisher: Redis;
    private subscriber: Redis;

    constructor({ host, port, password }: { host: string, port: number, password: string }) {
        this.publisher = new Redis({ host, port, password });
        this.subscriber = new Redis({ host, port, password });
    }

    async publish(channel: string, message: Message): Promise<number> {
        return this.publisher.publish(channel, JSON.stringify(message));
    }

    subscribe(channel: string, callback: (message: Message) => void): void {
        this.subscriber.subscribe(channel, (err, count) => {
            if (err) {
                console.error(`Failed to subscribe: ${err.message}`);
                return;
            }
            console.log(`Subscribed to ${count} channel(s)`);
        });

        this.subscriber.on('message', (chan: string, message: string) => {
            if (chan === channel) {
                callback(JSON.parse(message));
            }
        });
    }

    async disconnect(): Promise<void> {
        await this.publisher.quit();
        await this.subscriber.quit();
    }
}

export default EventBus;



