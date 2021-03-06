const { spritas_site } = require("../config.json");

module.exports = {
    name: "site",
    aliases: ["website", "forum"],
    description: "Get link to The Spritas forum.",
    async execute(message, args) {
        replyToMessage(message, spritas_site);
        //console.log(message);
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
        .catch(console.error);
    return m;
}