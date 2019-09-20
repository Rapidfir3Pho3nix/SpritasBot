/**
 * Created by Rapidfir3Pho3nix on 4/16/2017.
 */

const fs = require("fs");
const csv = require("csv-parser");
const Discord = require("discord.js");
const { prefix, discord_token, spritas_server, completed_channel, music_channel, spritas_youtube_reminder} = require("./config.json");
const ytdlDiscord = require("ytdl-core-discord");
const prism = require('prism-media');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// song queue
queue = [];

// current song index
queueIndex = 0;

// continue playing music
playMusic = true;

// read commands from files in command directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// set up functionality when bot is ready
client.on("ready", () => {
    console.log("Bot is ready!");
    const spritas = client.guilds.get(spritas_server);
    const reminderDelay = 2 * 60 * 60 * 1000;

    // set interval for reminder message in #completed channel
    client.setInterval(function(completedChan, reminder) {

        // read config for previous reminder message ID
        let config = JSON.parse(fs.readFileSync('./config.json'));
        let pastMessageID = config.reminder_message_id;

        // if current latest message ID does not match the ID for the last reminder message, delete the last reminder message, resend a new reminder message, and store new reminder message ID in config file
        if (completedChan.lastMessageID != pastMessageID) {
            completedChan.fetchMessage(pastMessageID).then(pastMessage => {
                console.log("grabbed previous message:", pastMessageID);
                pastMessage.delete().then(msg => {
                    console.log("previous message deleted:", msg);
                    completedChan.send(reminder).then(message => {
                        console.log("sent new message:", message.id)
                        config.reminder_message_id = message.id;
                        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
                    })
                    .catch(sendError => { console.log("Error encountered while sending new reminder message:", sendError); });
                })
                .catch(deleteError => { console.log("Error encountered while deleting previous reminder message:", deleteError); });                  
            })
            .catch(fetchError => {
                if (fetchError.message == '404: Not Found') {
                    completedChan.send(reminder).then(message => {
                        config.reminder_message_id = message.id;
                        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
                    })
                    .catch(sendError => { console.log("Error encountered while sending new reminder message after not finding previous message:", sendError); });
                }
                else { console.log("Error encountered while fetching previous reminder message:", fetchError); }
            });    
        }
    }, reminderDelay, spritas.channels.get(completed_channel), spritas_youtube_reminder);

    // read playlist into queue and shuffle the queue
    fs.createReadStream('./playlist.csv').pipe(csv()).on('data', (row) => {
        queue.push({ url: row["Video URL"], title: row["Title"] });
    })
    .on('end', () => { shuffle(queue); });

    // join music channel and play music
    spritas.channels.get(music_channel).join().then(connection => playMusicStream(connection))
    .catch(joinError => {
        console.log("Error encountered while trying to join music void channel:", joinError);
    });
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

client.on("guildMemberAdd", async (member) => {
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

function playMusicStream(voiceConnection) {
    let song = queue[queueIndex];
    console.log("grabbed next song from queue:", song);

    client.user.setPresence({ game: { name: song.title }});
    console.log("presence set to:", song.title);

    ytdlDiscord(song.url).then(input => {
        console.log("playing song");
        const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
        let dispatcher = voiceConnection.playConvertedStream(pcm);
        dispatcher.setVolumeLogarithmic(0.25);

        dispatcher.on("end", (reason) => {
            console.log("song ended")
            dispatcher = null;
            playNextSong(voiceConnection);
        })
        .on('error', (error) => {
            console.log("dispatcher error, skipping song:", error);
            dispatcher = null;
            playNextSong(voiceConnection)
        });
    })
    .catch(error => {
        console.log("error encountered using input from ytdldiscord:", error);
        console.log("input:", input);
        playNextSong(voiceConnection)
    });
}

function playNextSong(voiceConnection) {
    queueIndex = (queueIndex + 1) % queue.length;
    if (queueIndex == 0) shuffle(queue);
    if (playMusic) playMusicStream(voiceConnection);
    else {
        voiceConnection.channel.leave();
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}