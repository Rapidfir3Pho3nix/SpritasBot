/**
 * Created by Rapidfir3Pho3nix on 4/16/2017.
 */
const { prefix, discord_token, spritas_server, completed_channel, spritas_youtube_reminder, role_assignment_message_id, role_assignment_message, role_assignment_channel, 
    spritan_role_assign_emoji, announcements_role_assign_emoji, collab_role_assign_emoji, gamer_role_assign_emoji, 
    spritan_role, announcements_role, collab_role, gamer_role, welcome_channel, rules_channel
} = require("./config.json");

const fs = require("fs");
const Discord = require("discord.js");

const client = new Discord.Client();
client.commands = new Discord.Collection();

// read commands from files in command directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.name == "aotm") continue;
    if (command.name == "points") continue;
    client.commands.set(command.name, command);
}

// set up functionality when bot is ready
client.on("ready", () => {
    const spritas = client.guilds.cache.get(spritas_server);
    const reminderDelay = 8 * 60 * 60 * 1000;

    // set interval for reminder message in #completed channel
    client.setInterval(function(completedChan, reminder) {

        // read config for previous reminder message ID and role assignment message ID
        let config = JSON.parse(fs.readFileSync('./config.json'));
        let pastMessageID = config.reminder_message_id;

        // if current latest message ID does not match the ID for the last reminder message, delete the last reminder message, resend a new reminder message, and store new reminder message ID in config file
        if (completedChan.lastMessageID != pastMessageID) {
            completedChan.messages.fetch(pastMessageID).then(pastMessage => {
                log(false, "grabbed previous message:", pastMessageID);
                pastMessage.delete().then(msg => {
                    log(false, "previous message deleted:", msg);
                    completedChan.send(reminder).then(message => {
                        log(false, "sent new message:", message.id)
                        config.reminder_message_id = message.id;
                        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
                    })
                    .catch(sendError => { log(true, "Error encountered while sending new reminder message:", sendError); });
                })
                .catch(deleteError => { log(true, "Error encountered while deleting previous reminder message:", deleteError); });                  
            })
            .catch(fetchError => {
                if (fetchError.message == '404: Not Found') {
                    completedChan.send(reminder).then(message => {
                        config.reminder_message_id = message.id;
                        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
                    })
                    .catch(sendError => { log(true, "Error encountered while sending new reminder message after not finding previous message:", sendError); });
                }
                else { log(true, "Error encountered while fetching previous reminder message:", fetchError); }
            });    
        }
    }, reminderDelay, spritas.channels.cache.get(completed_channel), spritas_youtube_reminder);

    log(false, "Bot is ready!");
});

client.on("message", async (message) => {
    //ignore message if message is from bot
    if(message.author.bot) return;

    // ignore message if it doesn't begin with prefix
    if (!message.content.startsWith(prefix)) return;

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
        log(true, error);
        message.reply(`Sorry! A problem occurred trying to execute the ${commandName} command.`);
    }
});

client.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.get(welcome_channel);
    const rules = member.guild.channels.cache.get(rules_channel);

    // Do nothing if the channel wasn't found on this server
    if (!channel) return;

    // create embed welcome message
    const welcomeEmbed = new Discord.MessageEmbed()
        .setColor('#539ceb')
        .setTitle("The Spritas is a creative art community that is focused primarily on sprites and sprite animation; however, all forms of art are accepted here so don't hesitate to share any work not related to sprites or sprite animation.")
        .setAuthor(`${member.user.username}, welcome to The Spritas Discord server!`, "https://i.imgur.com/x0yysaP.png")
        .setDescription(`Be sure to read the ${rules} to learn how to access the rest of the server!`)
        .setThumbnail("https://i.imgur.com/hojIdon.png")
        .setImage("https://i.imgur.com/A7zZxK4.png")
        .setFooter(`The Spritas—${member.guild.memberCount}`);

    channel.send(welcomeEmbed)
        .then(message => log(false, `Sent message: ${message.content}`))
        .catch(console.error);
});

client.login(discord_token);

function log() {
    let args = [...arguments];
    let isError = args.shift();
    let date = '[' + new Date().toISOString() + ']';
    if (isError) {
        console.error(date, ...args);
    }
    else {
        console.log(date, ...args);
    }
}