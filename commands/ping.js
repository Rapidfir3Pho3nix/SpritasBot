module.exports = {
    name: "ping",
    description: "Gets round-trip latency and average one-way latency between bot and websocket server.",
    async execute(message, args) {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(message.client.ping)}ms`);       
    },
};