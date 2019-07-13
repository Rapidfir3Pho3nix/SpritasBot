module.exports = {
    name: "uptime",
    description: "Get the duration of how long SpritasBot has been active.",
    async execute(message, args) {       
        let uptime = message.client.uptime / 1000; //total uptime in seconds
        let days = Math.floor(uptime / 86400);
        uptime %= 86400;
        let hours = Math.floor(uptime / 3600)
        uptime %= 3600;
        let minutes = Math.floor(uptime / 60);
        let seconds = Math.floor(uptime % 60);

        replyToMessage(message, `SpritasBot has been up for: ${days} day(s), ${hours} hour(s), ${minutes} minute(s), ${seconds} second(s).`);
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.channel.recipient.username}`))
        .catch(console.error);
    return m;
}