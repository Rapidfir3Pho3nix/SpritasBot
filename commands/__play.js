const { spritas_server } = require("../config.json");
const ytdl = require("ytdl-core");
const ytdlDiscord = require("ytdl-core-discord");
const { Util } = require('discord.js');
const prism = require('prism-media');

module.exports = {
    name: "__play",
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
                
                const input = await ytdlDiscord(song.url);
                const pcm = input.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }));
                const dispatcher = connection.playConvertedStream(pcm);
                dispatcher.setVolumeLogarithmic(0.25);
            }
            catch (error){
                console.log(error);
                spritas.owner.createDM().then((channel) => { channel.send(error); });
            }
        } 
        else {
            message.member.createDM().then((channel) => { channel.send("You need to be in the voice channel first."); });
        }
    },
};