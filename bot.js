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

async function findUserInfo(league_api_SUMMONERV4_url){
    return (await fetch(league_api_SUMMONERV4_url)).json();
}

async function findUserRank(league_api_LEAGUEV4_url){
    let response = await fetch(league_api_LEAGUEV4_url);
    let dat = await response.json();
    return dat;
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
        //getting the user name from the user message
        while(user_message[i] != null){
            league_user_name += user_message[i];
            if(user_message[i+1] != null){
                league_user_name += "%20";
            }
            i++;
        }
        //the work goes here
        let league_api_SUMMONERV4_url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${league_user_name}?api_key=${process.env.RIOT_TOKEN}`;
        findUserInfo(league_api_SUMMONERV4_url).then(
            summoner_data => {
                let league_encrypted_id = summoner_data.id;
                let league_api_LEAGUEV4_url = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${league_encrypted_id}?api_key=${process.env.RIOT_TOKEN}`;
                findUserRank(league_api_LEAGUEV4_url).then(
                    user_rank_data => {
                        let user_rank = user_rank_data[1].tier; //the naming from the API is awkward, actual rank called tier, and division called rank.
                        let user_division = user_rank_data[1].rank;
                        let user_name = summoner_data.name;
                        let user_level = summoner_data.summonerLevel;
                        let user_icon_id = summoner_data.profileIconId;
                        console.log(user_rank);
                    }
                ).catch(error => console.log(error))
            }
        ).catch(error => console.log(error))
    }
});

client.login(process.env.BOT_TOKEN);