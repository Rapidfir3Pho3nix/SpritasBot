const { spritas_parallax_as2, spritas_parallax_as3 } = require("../config.json");

module.exports = {
    name: "parallax",
    description: "Gives user the parallax code to be used within Flash. Accepted tags are as2 (default) or as3.\n\nCalling the command with the as2 returns as2 parallax code while using as3 tag returns as3 parallax code.",
    execute(message, args) {
        if (!args.length || args[0] === "as2") {
            replyToMessage(message, spritas_parallax_as2);
        }
        else if (args[0] === "as3") {
            replyToMessage(message, spritas_parallax_as3);
        }
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
        .catch(console.error);
    return m;
}