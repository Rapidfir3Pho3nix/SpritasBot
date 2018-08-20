const { spritas_server } = require("../config.json");

module.exports = {
    name: "spritas",
    description: "Used to get Spritan role from FlashBot. Using this command means you acknowledge that you're aware of the rules on this server.",
    execute(message, args) {
        //if message is in dm and message author does not have role make them a Spritan
        if(message.channel.type == "dm" || message.channel.type == "group") {
            const spritas = client.guilds.get(spritas_server);

            if(!spritas.available) return;

            const spritans = spritas.roles.find("name", "Spritans").id;
            const mods = spritas.roles.find("name", "Spritas Moderators").id;
            const admins = spritas.roles.find("name", "Spritas Admins").id;

            spritas.fetchMember(message.author).then(member => {
                let memberRoles = member.roles;
                if(!memberRoles.has(spritans) && !memberRoles.has(mods) && !memberRoles.has(admins)) {
                    member.addRole(spritans);
                    replyToMessage(message, "Role change success. You are now a Spritan! Happy Posting!");
                } 
                else if(memberRoles.has(mods))
                    replyToMessage(message, "Role change succes- Wait a minute. You're a mod! I can't change your role!");                 
                else if(memberRoles.has(admins)) 
                    replyToMessage(message, "Role change succes- Wait a minute. You're an admin! Uh, sorry sir. I can't change your role. Plz don't ban me.");
                else if(memberRoles.has(spritans))
                    replyToMessage(message, "Role change succes- Wait a minute. You're already a Spritan! Get outta here ya silly!");                  
            });     
        } 
        else 
            replyToMessage(message, "If you're trying to change your role to Spritan, then you need to send me a DM saying \"!SPRITAS\" and then I can change your role.");
    },
};

async function replyToMessage(message, reply) {
    const m = await message.channel.send(reply)
        .then(message => console.log(`Sent message: ${message.content} to ${message.author.username}`))
        .catch(console.error);
    return m;
}