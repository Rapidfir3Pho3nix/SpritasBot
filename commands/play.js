const { spritas_server } = require("../config.json");
const ytdl = require("ytdl-core");
const ytdlDiscord = require("ytdl-core-discord");
const { Util } = require('discord.js');
const prism = require('prism-media')

module.exports = {
    name: "play",
    description: "",
    async execute(message, args) {
        const spritas = message.client.guilds.get(spritas_server);
        if(spritas.owner.user.username.indexOf("Rapidfir3Pho3nix") < 0) return;
        if(message.channel.type == "dm" || message.channel.type == "group"){
            return;
        }
        if(!args[0]) { 
            message.member.createDM().then((channel) => { channel.send("No YouTube URL argument provided."); });
            return;
        }

        const songInfo = await ytdl.getInfo(args[0]);
		const song = {
			id: songInfo.video_id,
			title: Util.escapeMarkdown(songInfo.title),
			url: songInfo.video_url
		};

        // Only try to join the sender's voice channel if they are in one themselves
        const voiceChannel = message.member.voiceChannel;
        if (voiceChannel) {
            const permissions = voiceChannel.permissionsFor(message.client.user);

            if(!permissions.has("CONNECT")){
                message.member.createDM().then((channel) => { channel.send("Can't connect to voice channel. Check permissions."); });
            }

            if(!permissions.has("CONNECT")){
                message.member.createDM().then((channel) => { channel.send("Can't speak in voice channel. Check permissions."); });
            }

            try {
                const connection = await voiceChannel.join();
                message.member.createDM().then((channel) => { channel.send("I have connected to the channel."); });
                const input = await ytdlDiscord(song.url);
                const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
                const dispatcher = connection.playConvertedStream(pcm);
                dispatcher.setVolumeLogarithmic(0.25);
                                    
                // const dispatcher = connection.playOpusStream(await ytdlDiscord(song.url, { volume: 0.5 }))
                //     .on("end", (reason) => {
                //         console.log("stream ended");
                //         console.log(reason);
                //         voiceChannel.leave();
                //     })
                //     .on('error', error => console.error(error));
                // dispatcher.setVolumeLogarithmic(2 / 5);
            }
            catch (error){
                console.log(error);
                console.error(`Could not connect to the voice channel: ${error}`);
                message.member.createDM().then((channel) => { channel.send(`Could not connect to the voice channel: ${error}`); });
            }
        } 
        else {
            message.member.createDM().then((channel) => { channel.send("You need to be in the voice channel first."); });
        }
    },
};