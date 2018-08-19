/**
 * Created by Rapidfir3Pho3nix on 4/16/2017.
 */

const Discord = require("discord.js");
const client = new Discord.Client();

//load settings file for SpritasBot
const settings = require("./settings.json");
const http = require("http");
var fs = require('fs');

client.on("ready", () => {
    console.log("Bot is ready!");
    client.user.setPresence({ game: { name: "on The Spritas Discord Server" }});
    const spritas = client.guilds.get(settings.spritas_server);
    spritas.owner.createDM().then((channel) => {
        channel.send("Bot is ready!");
    });
});

client.on("message", async (message) => {
    //ignore messages from bots
    if(message.author.bot) return;

    //talking to spritasbot
    // if(message.mentions.users.has(client.user.id)) {
    //     fs.readFile("cleverbot.json", (err, data) => {
    //         if(err) console.log(err);
    //         var clevState = JSON.parse(data);
    //         let input = message.content.replace(/<(.*?)>/g, "").replace(/\s\s+/g, " ").trim().replace(/\\/, "");
    //         console.log(message.author.username + " said \"" + input + "\"");
    //         let queryUrl = "http://www.cleverbot.com/getreply" + "?key=" + settings.cleverbot_token + "&input=" + input;
    //         if(clevState["cs"]) queryUrl += "&cs=" + clevState["cs"];
    //         const request = http.get(queryUrl, (response) => {
    //             let body = "";
    //             response.on("data", (buf) => {
    //                 body += buf;
    //             });
    //             response.on("end", (err) => {
    //                 if(err) console.log(err);
    //                 const clevObj;
    //                 try {
    //                     clevObj = JSON.parse(body.toString());
    //                 }
    //                 catch(error){
    //                     clevState["cs"] = "";
    //                     fs.writeFile("cleverbot.json", JSON.stringify(clevState), function(err) { if (err) console.log(err); });
    //                     message.channel.send(message.author + ", " + "...");
    //                     return;
    //                 }
    //                 clevState["cs"] = clevObj["cs"];
    //                 message.channel.send(message.author + ", " + clevObj["output"]);
    //                 fs.writeFile("cleverbot.json", JSON.stringify(clevState), function(err) { if (err) console.log(err); });
    //             });
    //         });
    //     });
    // }

    if(message.content.indexOf(settings.prefix) !== 0) return;
    const args = message.content.slice(settings.prefix.length).split(/ +/g);
    const command = args.shift().toLowerCase();

    //Commands for SpritasBot

    //!help
    if(command === "help") {
        message.channel.send("Current commands: ping, uptime, site, vcam, tutorial, parallax, flash, spritas"
        + "\nMore details to be added...");
    }

    //!ping
    if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }

    //!uptime
    if(command === "uptime") {
        let reply = 'Uptime: ';
        let time = message.client.uptime / 1000;
        let seconds = time % 60 * 1;
        seconds = Math.floor(seconds);
        time /= 60;
        let minutes = time % 60 * 1;
        minutes = Math.floor(minutes);
        time /= 60;
        let hours = time % 24 * 1;
        hours = Math.floor(hours);
        if(hours === 1) reply += hours + ' hour '; 
        else reply += hours + ' hours ';
        if(minutes === 1) reply += minutes + ' minute '; 
        else reply += minutes + ' minutes ';
        if(seconds === 1) reply += seconds + ' second.';
        else reply += seconds + ' seconds.';
        message.channel.send(reply);
    }

    //!site
    if(command === "site") message.channel.send("<https://www.thespritas.net/>");

    //!vcam, preloader, intro
    if(command === "vcam" || command === "preloader" || command === "intro") message.channel.send('<https://www.thespritas.net/t7199-the-spritas-intro-vcams-and-preloaders>');

    //!tutorial
    if(command === "tutorial") message.channel.send('<https://www.thespritas.net/t184-how-to-sprite-animate-with-flash>');

    //!parallax
    if(command === "parallax") 
        message.channel.send('```onClipEvent (load) { \n\t//distance ranges from 0 to 1 \n\tvar distance:Number = 0.2; \n\t//ignore the below stuff \n\tvar x0:Number = this._x; \n\tvar y0:Number = this._y; \n\tvar vcamx0:Number = _root.vcam._x; \n\tvar vcamy0:Number = _root.vcam._y; \n} \n\nonClipEvent (enterFrame) { \n\t_x = (_root.vcam._x - vcamx0) * distance + x0; \n\t_y = (_root.vcam._y - vcamy0) * distance + y0; \n}```Tutorial: https://i.imgur.com/ZzfKHuB.png');

    //!flash
    if(command === "flash") {
        let flashResponse = 'Flash MX = ...what year is it?';
	    flashResponse += '\nFlash 8 - has a pacemaker and always tells you to get off its lawn';
        flashResponse += '\nFlash CS3 - literally Jesus';
        flashResponse += '\nFlash CS4 - thinks its an orphan, but its parents sold it for drug money';
        flashResponse += '\nFlash CS5 - probably should have been aborted';
        flashResponse += '\nFlash CS5.5 - definitely should have been aborted';
        flashResponse += '\nFlash CS6 - can be a bit of an asshole, but alright; eats all your food';
        flashResponse += '\nFlash CC - eats all your food and more but gives you a dollar if you ask for one';
        flashResponse += '\nAdobe Animate - hipster that thinks it\'s cool because it changed its name';

        message.channel.sendMessage(flashResponse);
    }

    //!spritas
    if(command === "spritas") {
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
                    message.channel.send('Role change success. You are now a Spritan! Happy Posting!')
                        //.then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
                        .catch(console.error);
                } else if(memberRoles.has(mods)) {
                    message.channel.send('Role change succes- Wait a minute. You\'re a mod! I can\'t change your role!')
                        //.then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
                        .catch(console.error);
                } else if(memberRoles.has(admins)) {
                    message.channel.send('Role change succes- Wait a minute. You\'re an admin! Uh, sorry sir. I can\'t change your role. Plz don\'t ban me.')
                        //.then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
                        .catch(console.error);
                } else if(memberRoles.has(spritans)){
                    message.channel.send('Role change succes- Wait a minute. You\'re already a Spritan! Get outta here ya silly!')
                        //.then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
                        .catch(console.error);
                }
            });     
        } 
        else {
            message.reply('If you\'re trying to change your role to Spritan, then you need to send me a DM saying "!SPRITAS" and then I can change your role.');
        }
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

client.login(settings.discord_token);
