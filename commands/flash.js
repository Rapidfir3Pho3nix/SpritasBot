const { spritas_flash } = require("../config.json");

module.exports = {
    name: "flash",
    description: "Get SpritasBot's opinion on the different versions of Flash.",
    async execute(message, args) {
        replyToMessage(message, spritas_flash);
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
        .catch(console.error);
    return m;
}