const { spritas_server } = require("../config.json");
const ytdl = require("ytdl-core");

module.exports = {
    name: "play",
    description: "",
    async execute(message, args) {
        const spritas = message.client.guilds.get(spritas_server);
        if(spritas.owner.user.username.indexOf("Rapidfir3Pho3nix") < 0) return;
        if(!args[0]) message.member.createDM().then((channel) => { channel.send("No YouTube URL argument provided."); });

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

                const dispatcher = connection.playStream(ytdl(args[0]))
                    .on("end", () => {
                        console.log("stream ended");
                        voiceChannel.leave();
                    })
                    .on("error", (error) =>{
                        console.error(error);
                    });
                
                dispatcher.setVolumeLogarithmic(5 / 5);
            }
            catch (error){
                console.error(`Could not connect to the voice channel: ${error}`);
                message.member.createDM().then((channel) => { channel.send(`Could not connect to the voice channel: ${error}`); });
            }
        } 
        else {
            message.member.createDM().then((channel) => { channel.send("You need to be in the voice channel first."); });
        }
    },
};