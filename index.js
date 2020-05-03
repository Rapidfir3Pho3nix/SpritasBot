/**
 * Created by Rapidfir3Pho3nix on 4/16/2017.
 */
const { prefix, discord_token, spritas_server, completed_channel, spritas_youtube_reminder, role_assignment_message_id, role_assignment_message, role_assignment_channel, 
    spritan_role_assign_emoji, announcements_role_assign_emoji, collab_role_assign_emoji, gamer_role_assign_emoji, 
    spritan_role, announcements_role, collab_role, gamer_role, welcome_channel, rules_channel
} = require("./config.json");

const fs = require("fs");
const Discord = require("discord.js");

const SQLite = require("better-sqlite3");
const sql = new SQLite('./spritas-discord.sqlite');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// read commands from files in command directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// set up functionality when bot is ready
client.on("ready", () => {
    // Check if the table "points" exists.
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'points';").get();
    if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE points (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql.prepare("CREATE UNIQUE INDEX idx_points_id ON points (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    // And then we have two prepared statements to get and set the score data.
    client.getScore = sql.prepare("SELECT * FROM points WHERE user = ? AND guild = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO points (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);");

    const spritas = client.guilds.cache.get(spritas_server);
    const reminderDelay = 8 * 60 * 60 * 1000;

    // set up role reaction if necessary
    if (!role_assignment_message_id) {
        const roleChan = spritas.channels.cache.get(role_assignment_channel);
        const spritanEmoji = spritas.emojis.cache.find(emoji => emoji.name === spritan_role_assign_emoji);
        const collabEmoji = spritas.emojis.cache.find(emoji => emoji.name === collab_role_assign_emoji);
        const gamerEmoji = spritas.emojis.cache.find(emoji => emoji.name === gamer_role_assign_emoji);
        const announceEmoji = spritas.emojis.cache.find(emoji => emoji.name === announcements_role_assign_emoji);
        const roleEmbed = new Discord.RichEmbed()
            .setColor('#0099ff')
            .setTitle('Role Assignment')
            .setDescription(role_assignment_message)
            .addField('Spritan role', `${spritanEmoji} - Grants basic access to the server.`, false)
            .addField('Announcements role', `${announceEmoji} - This role will let you be notified when there are any server announcements made so that you are up to date with events going on in the server.`, false)
            .addField('Collaboration role', `${collabEmoji} - Grants access to the Spritas collaborations area and will let you be notified about any collab-related announcements.`, false)
            .addField('Gamer role', `${gamerEmoji} - This role will let you be notified whenever we have any video game related events.`, false);

        roleChan.send(roleEmbed).then(message => {
            let config = JSON.parse(fs.readFileSync('./config.json'));
            config.role_assignment_message_id = message.id;
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        });
    }

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

    if (message.guild) {
        let score = client.getScore.get(message.author.id, message.guild.id);
        if (!score) score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 };
        score.points++;
        const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
        if(score.level < curLevel) {
            score.level++;
            //message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
        }
        client.setScore.run(score);
    }

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

client.on('raw', event => {
    let config = JSON.parse(fs.readFileSync('./config.json'));

    const eventName = event.t;
    if (eventName === 'MESSAGE_REACTION_ADD') {
        if (event.d.message_id == config.role_assignment_message_id) {
            let roleChan = client.guilds.cache.get(spritas_server).channels.cache.get(event.d.channel_id);
            if (roleChan.messages.cache.has(event.d.message_id)) return;
            else {
                roleChan.messages.fetch(event.d.message_id).then(message => {
                    let reaction = event.d;
                    let user = client.guilds.cache.get(spritas_server).members.cache.get(event.d.user_id);
                    client.emit('messageReactionAdd', reaction, user);
                })
                .catch(err => log(true, err));
            }
        }
    } 
    else if (eventName === 'MESSAGE_REACTION_REMOVE') {
        if (event.d.message_id == config.role_assignment_message_id) {
            let roleChan = client.guilds.cache.get(spritas_server).channels.cache.get(event.d.channel_id);
            if (roleChan.messages.cache.has(event.d.message_id)) return;
            else {
                roleChan.messages.fetch(event.d.message_id).then(message => {
                    let reaction = event.d;
                    let user = client.guilds.cache.get(spritas_server).members.cache.get(event.d.user_id);
                    client.emit('messageReactionRemove', reaction, user);
                })
                .catch(err => log(true, err));
            }
        }
    }
});

client.on('messageReactionAdd', (messageReaction, user) => {
    let spritas = client.guilds.cache.get(spritas_server);
    let emojiName = messageReaction.emoji.name;
    let member = spritas.members.cache.get(user.id);
    let roles = [];
    switch(emojiName) {
        case spritan_role_assign_emoji:
            roles.push(spritas.roles.cache.get(spritan_role));           
            break;
        case announcements_role_assign_emoji:
            roles.push(spritas.roles.cache.get(spritan_role));
            roles.push(spritas.roles.cache.get(announcements_role));
            break;
        case collab_role_assign_emoji:
            roles.push(spritas.roles.cache.get(spritan_role));
            roles.push(spritas.roles.cache.get(collab_role));
            break;
        case gamer_role_assign_emoji:
            roles.push(spritas.roles.cache.get(spritan_role));
            roles.push(spritas.roles.cache.get(gamer_role));
            break;
        default:
            break;
    }
    if (roles.length && member) {
        roles.forEach(role => {
            member.roles.add(role.id); 
        });
    }
});

client.on('messageReactionRemove', (messageReaction, user) => {
    let spritas = client.guilds.cache.get(spritas_server);
    let emojiName = messageReaction.emoji.name;
    let member = spritas.members.cache.get(user.id);
    let role = null;
    switch(emojiName) {
        case announcements_role_assign_emoji:
            role = spritas.roles.cache.get(announcements_role);
            break;
        case collab_role_assign_emoji:
            role = spritas.roles.cache.get(collab_role);
            break;
        case gamer_role_assign_emoji:
            role = spritas.roles.cache.get(gamer_role);
            break;
        default:
            break;
    }
    if (role && member) member.roles.remove(role.id);
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