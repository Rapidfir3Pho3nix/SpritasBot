const { staff_channel } = require("../config.json");

module.exports = {
    name: "aotm",
    description: "Collect possible aotm entries.",
    async execute(message, args) {
        if (message.channel.id != staff_channel) return;
        replyToMessage(message, spritas_flash);
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.channel.recipient.username}`))
        .catch(console.error);
    return m;
}