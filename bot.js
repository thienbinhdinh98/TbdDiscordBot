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
                //getting encrypted summoner id to make an url for api
                let league_encrypted_id = summoner_data.id;
                let league_api_LEAGUEV4_url = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${league_encrypted_id}?api_key=${process.env.RIOT_TOKEN}`;
                findUserRank(league_api_LEAGUEV4_url).then(
                    user_rank_data => {
                        //defining some variable neccessary to store from the json file
                        //the naming from the API is awkward, actual rank called tier, and division called rank.
                        let user_rank = user_rank_data[1].tier; 
                        let user_division = user_rank_data[1].rank;
                        //naming the variables with actual name players use.
                        let user_name = summoner_data.name;
                        let user_level = summoner_data.summonerLevel;
                        let user_icon_id = summoner_data.profileIconId;
                        let Winrate = 100*(user_rank_data[1].wins / (user_rank_data[1].wins + user_rank_data[1].losses));
                        let game_win = user_rank_data[1].wins;
                        let game_lost = user_rank_data[1].losses;
                        let player_info_embed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle('Summoner Information')
                            .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/10.18.1/img/profileicon/${user_icon_id}.png`)
                            .addFields(
                                { name: 'Summoner Name', value: user_name},
                                { name: '\u200B', value: '\u200B' },
                                { name: 'Summoner Level', value: user_level, inline: true },
                                { name: 'Rank', value: user_rank+' '+user_division, inline: true },
                            )
                            .addField('Win rate', Winrate.toFixed(2)+"%", true)
                            .setTimestamp()
                        msg.channel.send(player_info_embed);
                        // TODO: handle undefined rank(not finished ranked or not level 30)
                            
                    }
                ).catch(error => console.log(error))
            }
        ).catch(error => console.log(error))
    }
});

client.login(process.env.BOT_TOKEN);