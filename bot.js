require('dotenv').config()
const fetch = require("node-fetch");
const Discord  = require('discord.js');
const client = new Discord.Client();

const BOT_PREFIX = '!';
const MOD_ME_COMMAND = 'mod-me';
const FIND_USER = 'find';
 
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
        var i = 1;
        let league_user_name = '';
        let league_encrypted_id = '';
        while(user_message[i] != null){
            league_user_name += user_message[i];
            if(user_message[i+1] != null){
                league_user_name += "%20";
            }
            i++
        }
        let league_api_SUMMONERV4_url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${league_user_name}?api_key=${process.env.RIOT_TOKEN}`;
        fetch(league_api_SUMMONERV4_url).then(
            res =>res.json()
        ).then(
            data =>{
                let {name, summonerLevel, id} = data;
                msg.reply("\nSummoner: "+ name + "\nSummoner level: "+ summonerLevel);
                league_encrypted_id = id;
                let league_api_LEAGUEV4_url = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${league_encrypted_id}?api_key=${process.env.RIOT_TOKEN}`;
                fetch(league_api_LEAGUEV4_url).then(
                    res1 => res1.json()
                ).then(
                    data1=>console.log(data1[1])
                ).catch(error => console.log(error))
                msg.reply(data1.tier);
            }
            
        ).catch(error => console.log(error))
    }
});

client.login(process.env.BOT_TOKEN);