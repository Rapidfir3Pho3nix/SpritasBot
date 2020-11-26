const { staff_channel } = require("../config.json");

module.exports = {
    name: "points",
    description: "Collect possible aotm entries.",
    async execute(message, args) {
        return;
        if (message.channel.id != staff_channel) return;
        let score = message.client.getScore.get(message.author.id, message.guild.id);
        replyToMessage(message, `You currently have ${score.points} points and are level ${score.level}.`);
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(res => console.log(`Sent message: '${reply}' to ${message.author.username}`))
        .catch(console.error);
    return m;
}