require('dotenv').config()

const Discord  = require('discord.js');
const client = new Discord.Client();

const BOT_PREFIX = '!';
const MOD_ME_COMMAND = 'mod-me';
const FIND_USER = 'find';
const league_user_name = '';
 
client.on('ready', ()=> {
    console.log('Logged in and ready to fire');
});

function mod_user(member){
    member.roles.add(process.env.MOD_ID);
}



client.on('message', msg =>{
    //just a fun function to do here
    if(msg.content == 'I love you bot'){
        msg.reply("I love you too ❤️");
        msg.react("❤️");
    }

    //splitting the message content from the user
    let user_message = msg.content.split(' ');
    if(user_message[0] === `${BOT_PREFIX}${FIND_USER}`){
        let league_user_name =  user_message[1];
        let league_api_SUMMONERV4_url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${league_user_name}?api_key=${process.env.RIOT_TOKEN}`;
        let response = fetch(league_api_SUMMONERV4_url);
        let data = response.json();
        let {name, summonerLevel} = data;
        msg.reply(name);
        msg.reply(summonerLevel);
    }
    
    

});

client.login(process.env.BOT_TOKEN);