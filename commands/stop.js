const { spritas_server } = require("../config.json");
const ytdl = require("ytdl-core");

module.exports = {
    name: "stop",
    description: "",
    async execute(message, args) {
        const spritas = message.client.guilds.get(spritas_server);
        if(spritas.owner.user.username.indexOf("Rapidfir3Pho3nix") < 0) return;

        // Only leave the sender's voice channel if they are in one themselves
        const voiceChannel = message.member.voiceChannel;
        if (voiceChannel) 
            voiceChannel.leave();       
        else 
            message.member.createDM().then((channel) => { channel.send("You need to be in the voice channel first."); });
        
    },
};