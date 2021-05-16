require('dotenv').config()

const Discord  = require('discord.js');
const client = new Discord.Client();

const BOT_PREFIX = '!';
const MOD_ME_COMMAND = 'mod-me';

client.on('ready', ()=> {
    console.log('Logged in and ready to fire');
});

function mod_user(member){
    member.roles.add(process.env.MOD_ID);
}



client.on('message', msg =>{
    if(msg.content === `${BOT_PREFIX}${MOD_ME_COMMAND}`){
        mod_user(msg.member);
    }

    if(msg.content == 'I love you bot'){
        msg.reply("I love you too ❤️");
        msg.react("❤️");
    }

    if(msg.content === '!ping'){
        msg.channel.send("it's Binh")
        //msg.reply('Pong!');
    }
});

client.login(process.env.BOT_TOKEN);