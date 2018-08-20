const { spritas_vcam } = require("../config.json");

module.exports = {
    name: "vcam",
    aliases: ["preloader", "intro"],
    description: "Get link to The Spritas vcam (AS2 and AS3), preloader (AS2 and AS3), and video intro.",
    execute(message, args) {
        replyToMessage(message, spritas_vcam)
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
        .catch(console.error);
    return m;
}