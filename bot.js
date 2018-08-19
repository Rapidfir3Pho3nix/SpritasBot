/**
 * Created by Rapidfir3Pho3nix on 4/16/2017.
 */

const Discord = require("discord.js");
const client = new Discord.Client();

//load settings file for SpritasBot
const settings = require("./settings.json");
const http = require("http");

client.on("ready", () => {
    let readyMsg = "Bot is ready!";
    console.log(readyMsg);
    client.user.setPresence({ game: { name: "on The Spritas Discord Server" }});
    const spritas = client.guilds.get(settings.spritas_server);
    spritas.owner.createDM().then((channel) => { channel.send(readyMsg); });
});

client.on("message", async (message) => {
    //ignore messages from bots
    if(message.author.bot) return;

    //ignore message if it doesn't begin with prefix
    if(message.content.indexOf(settings.prefix) !== 0) return;

    //get command and arguemnts
    const args = message.content.slice(settings.prefix.length).split(/ +/g);
    const command = args.shift().toLowerCase();

    //Commands for SpritasBot
    switch(command){
        case "help":
            let reply = "Current commands: ping, uptime, site, vcam, tutorial, parallax, flash, spritas\nMore details to be added...";           
            replyToMessage(message, reply);
            break;
        case "ping":
            // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
            // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
            let reply = "Ping?";
            const m = replyToMessage(message, reply);
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
            break;
        case "uptime":
            let reply = getClientUptimeResponse(message.client);
            replyToMessage(message, reply);
            break;
        case "site":
            let reply = "<https://www.thespritas.net/>";
            replyToMessage(message, reply)
            break;
        case "vcam":
        case "preloader":
        case "intro":
            let reply = "<https://www.thespritas.net/t7199-the-spritas-intro-vcams-and-preloaders>";
            replyToMessage(message, reply);
            break;
        case "tutorial":
            let reply = "<https://www.thespritas.net/t184-how-to-sprite-animate-with-flash>";
            replyToMessage(message, reply);
            break;
        case "parallax":
            let reply = "```onClipEvent (load) { \n\t//distance ranges from 0 to 1 \n\tvar distance:Number = 0.2; \n\t//ignore the below stuff \n\tvar x0:Number = this._x; \n\tvar y0:Number = this._y; \n\tvar vcamx0:Number = _root.vcam._x; \n\tvar vcamy0:Number = _root.vcam._y; \n} \n\nonClipEvent (enterFrame) { \n\t_x = (_root.vcam._x - vcamx0) * distance + x0; \n\t_y = (_root.vcam._y - vcamy0) * distance + y0; \n}```Tutorial: https://i.imgur.com/ZzfKHuB.png";
            replyToMessage(message, reply);
            break;
        case "flash":
            let reply = 'Flash MX = ...what year is it?';
            reply += '\nFlash 8 - has a pacemaker and always tells you to get off its lawn';
            reply += '\nFlash CS3 - literally Jesus';
            reply += '\nFlash CS4 - thinks its an orphan, but its parents sold it for drug money';
            reply += '\nFlash CS5 - probably should have been aborted';
            reply += '\nFlash CS5.5 - definitely should have been aborted';
            reply += '\nFlash CS6 - can be a bit of an asshole, but alright; eats all your food';
            reply += '\nFlash CC - eats all your food and more but gives you a dollar if you ask for one';
            reply += '\nAdobe Animate - hipster that thinks it\'s cool because it changed its name';

            replyToMessage(message, reply);
            break;
        case "spritas":
            //if message is in dm and message author does not have role make them a Spritan
            if(message.channel.type == "dm" || message.channel.type == "group") {
                const spritas = client.guilds.get(settings.spritas_server);
                if(!spritas.available) return;
                const spritans = spritas.roles.find('name', 'Spritans').id;
                const mods = spritas.roles.find('name', 'Spritas Moderators').id;
                const admins = spritas.roles.find('name', 'Spritas Admins').id;
                const getMember = spritas.fetchMember(message.author);
                getMember.then(member => {
                    let memberRoles = member.roles;
                    if(!memberRoles.has(spritans) && !memberRoles.has(mods) && !memberRoles.has(admins)) {
                        member.addRole(spritans);
                        replyToMessage(message, "Role change success. You are now a Spritan! Happy Posting!");
                    } 
                    else if(memberRoles.has(mods))
                        replyToMessage(message, "Role change succes- Wait a minute. You\'re a mod! I can\'t change your role!");                 
                    else if(memberRoles.has(admins)) 
                        replyToMessage(message, "Role change succes- Wait a minute. You\'re an admin! Uh, sorry sir. I can\'t change your role. Plz don\'t ban me.");
                    else if(memberRoles.has(spritans))
                        replyToMessage(message, "Role change succes- Wait a minute. You\'re already a Spritan! Get outta here ya silly!");                  
                });     
            } 
            else 
                replyToMessage(message, "If you\'re trying to change your role to Spritan, then you need to send me a DM saying \"!SPRITAS\" and then I can change your role.");       
            break;
        default:
            break;
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

function replyToMessage(message, reply){
    await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
        .catch(console.error);
    return message;
}

function getClientUptimeResponse(client){
    let uptime = client.uptime / 1000; //total uptime in seconds
    let days = Math.floor(uptime / 86400);
    uptime %= 86400;
    let hours = Math.floor(uptime / 3600)
    uptime %= 3600;
    let minutes = Math.floor(uptime / 60);
    let seconds = uptime % 60;

    return `SpritasBot has been up for: ${days} day(s), ${hours} hour(s), ${minutes} minute(s), ${seconds} second(s).`;
}

client.login(settings.discord_token);
