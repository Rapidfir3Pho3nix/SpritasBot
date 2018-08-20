/**
 * Created by Rapidfir3Pho3nix on 4/16/2017.
 */

const fs = require("fs");
const Discord = require("discord.js");
const { prefix, discord_token, spritas_server } = require("./config.json");

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on("ready", () => {
    let readyMsg = "Bot is ready!";
    console.log(readyMsg);
    client.user.setPresence({ game: { name: "on The Spritas Discord Server" }});
    const spritas = client.guilds.get(spritas_server);
    spritas.owner.createDM().then((channel) => { channel.send(readyMsg); });
});

client.on("message", async (message) => {
    //ignore message if it doesn't begin with prefix or if message is from bot
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    //get command and arguemnts
    const args = message.content.slice(prefix.length).split(/ +/g);
    const commandName = args.shift().toLowerCase();

    //if command does not exist return
    if (!client.commands.has(commandName)) return;

    //get command to execute
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    //execute command
    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply(`Sorry! A problem occurred trying to execute the ${commandName} command.`);
    }
});

client.on("guildMemberAdd", (member) => {
    member.createDM().then((dmChannel) => {
        dmChannel.send("Welcome to The Spritas Discord Server!"
        + "\n\nWe are the official Discord server of The Spritas: <https://www.thespritas.net/>"
        + "\n\n```Hi, I'm SpritasBot, nice to meetcha! Right now you may only post to the General channel. In order to post to the other channels you must send me a message that says \"!SPRITAS\" (don't include the quotes). Doing so will make you an honorary Spritan and give you access to the other channels! This also means we will assume you have read the rules for this Discord server, which can be found below. Happy Posting! :)```"
        + "\n\n**SERVER RULES:**"
        + "\n• Use common sense and have respect for others. We do not tolerate bullying or discrimination."
        + "\n• Listen to the moderators and the admins. If you are asked to do something by a member of one of these groups, then do it."
        + "\n• Try to discuss topics in their appropriate channels; e.g. talk about video games goes in #gaming."
        + "\n• If you have an issue with another member try to alert an online moderator or admin."
        + "\n• Don't spam. Don't spam in the same and/or different channels to get attention."
        + "\n• Links to any illegal downloads or copyrighted material as well as discussion about illegal downloads and copyrighted material is not allowed."
        + "\n• NSFW material may be posted in the #mature channel, however, **Pornographic material is strictly prohibited.**"
        + "\n• The same rules from the forums apply here as well. Make sure you have read them as well: <https://www.thespritas.net/t7226-basic-forum-rules>"
        + "\n\n**VOICE CHANNEL RULES:**"
        + "\n• Be mindful of your audio quality. If you have a lot of background noise/bad mic quality, then use the push-to-talk feature to engage in voice chat. You will be muted for substantially bad audio quality."
        + "\n• Use your inside voice and try to keep loud, disruptive noises to a minimum. Things can be exciting at times but remember that people are there to talk to each other."
        + "\n\nPlease enjoy your stay!");
    })
    .catch(console.error);
});

client.login(discord_token);
