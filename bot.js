require('dotenv').config()
const fetch = require("node-fetch");
const Discord  = require('discord.js');
const client = new Discord.Client();

const BOT_PREFIX = '!';
const MOD_ME_COMMAND = 'mod-me';
const FIND_USER = 'find';
const MATCH_HISTORY = "match";

client.on('ready', ()=> {
    console.log('Logged in and ready to fire');
});

//fetch the SUMMONER_V4 API
async function findUserInfo(league_api_SUMMONERV4_url){ 
    return (await fetch(league_api_SUMMONERV4_url)).json();
}

//fetch the LEAGUE_V4 API
async function findUserRank(league_api_LEAGUEV4_url){
    let response = await fetch(league_api_LEAGUEV4_url);
    let dat = await response.json();
    return dat;
}

async function findMatchIdByPuuid(league_api_MATCHV5byPuuid_url){
    return (await fetch(league_api_MATCHV5byPuuid_url)).json();
}

async function findMatchHistoryById(league_api_MATCHV5byMatchId){
    return (await fetch(league_api_MATCHV5byMatchId)).json();
}

function getLeagueUserName(user_message){
    //getting the user name from the user message
    var i = 1;
    let league_user_name = "";
    while(user_message[i] != null){ //user name is often small so the big O of this loop does not affect much (loop 2 or 3 times only)
        league_user_name += user_message[i];
        if(user_message[i+1] != null){
            league_user_name += " ";
        }
        i++;
    }
    return league_user_name;
}

client.on('message', msg =>{
    //------------------------------------------------------------------------------------------------------------------------
    //just a fun function to do here
    if(msg.content == 'I love you bot'){
        msg.reply("I love you too ❤️");
        msg.react("❤️");
    }

    //Split the message content from the user
    let user_message = msg.content.split(' '); //this an array

    //------------------------------------------------------------------------------------------------------------------------
    //FIND USER INFO
    if(user_message[0] === `${BOT_PREFIX}${FIND_USER}`){
        //encode URL of the player name to be sent to the API
        league_user_name = encodeURIComponent(getLeagueUserName(user_message));
        //Create URL
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
                        let rank_data;
                        if(user_rank_data[0].queueType ==  "RANKED_SOLO_5x5"){
                            rank_data = user_rank_data[0];
                        }
                        if(user_rank_data[0].queueType !=  "RANKED_SOLO_5x5"){
                            rank_data = user_rank_data[1];
                        }
                        
                        let user_rank = "Unranked";
                        let user_division = "";
                        let game_win = "Unranked";
                        let game_lost = "Unranked";
                        let Winrate;
                        //if the api return undefined for player who hasnt played ranked
                        if(rank_data != null){
                            user_rank = rank_data.tier;
                            user_division = rank_data.rank;
                            game_win = rank_data.wins;
                            game_lost = rank_data.losses;
                        }
                        
                        if(game_win == "Unranked"){
                            Winrate = "Unranked";
                        }else{
                            Winrate = 100*(game_win / (game_lost+game_win));
                            Winrate = Winrate.toFixed(2) + "%";
                        }
                        //naming the variables with actual terms players use.
                        let user_name = summoner_data.name;
                        let user_level = summoner_data.summonerLevel;
                        let user_icon_id = summoner_data.profileIconId;
                        //doing embed to show the information
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
                            .addField('Win rate', Winrate, true)
                            .setTimestamp()
                        msg.channel.send(player_info_embed);
                    }
                ).catch(error => console.log(error))
            }
        ).catch(error => console.log(error))
    }

    //------------------------------------------------------------------------------------------------------------------------
    //FIND MATCH HISTORY
    if(user_message[0] === `${BOT_PREFIX}${MATCH_HISTORY}`){
        //encode URL of the player name to be sent to the API
        league_user_name = encodeURIComponent(getLeagueUserName(user_message));
        //Create URL
        let league_api_SUMMONERV4_url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${league_user_name}?api_key=${process.env.RIOT_TOKEN}`;
        findUserInfo(league_api_SUMMONERV4_url).then(
            summoner_data => {
                let league_api_MATCHV5byPuuid_url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner_data.puuid}/ids?start=0&count=10&api_key=${process.env.RIOT_TOKEN}`;
                findMatchIdByPuuid(league_api_MATCHV5byPuuid_url).then(
                    match_id_list =>{
                        for(var i = 0; i < 10; i++ ){
                            let league_api_MATCHV5byMatchId = `https://americas.api.riotgames.com/lol/match/v5/matches/${match_id_list[i]}?api_key=${process.env.RIOT_TOKEN}`
                            findMatchHistoryById(league_api_MATCHV5byMatchId).then(
                                match_data =>{
                                    //TODO: now what to do with match_data?
                                }
                            ).catch(error => console.log(error));
                        }
                    }
                ).catch(error => console.log(error));
            }
        ).catch(error => console.log(error));
    }

});

client.login(process.env.BOT_TOKEN);