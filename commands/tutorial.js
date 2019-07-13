const { spritas_tutorial } = require("../config.json");

module.exports = {
    name: "tutorial",
    aliases: ["tutorials", "tut", "tuts"],
    description: "Get link to Eric's flash tutorials on The Spritas.",
    async execute(message, args) {
        replyToMessage(message, spritas_tutorial);
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.channel.recipient.username}`))
        .catch(console.error);
    return m;
}