require('dotenv').config()

const fetch = require("node-fetch");
const Discord  = require('discord.js');
const client = new Discord.Client();

const ddragon_version_api_url = `https://ddragon.leagueoflegends.com/api/versions.json`;

const BOT_PREFIX = '!';
const MOD_ME_COMMAND = 'mod-me';
const FIND_USER = 'find';
const MATCH_HISTORY = "match";

client.on('ready', ()=> {
    console.log('Logged in and ready to fire');
});

async function findDDragonVersion(){ 
    return (await fetch(ddragon_version_api_url)).json();
}

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
                        let user_rank = "Unranked";
                        let user_division = "";
                        let game_win = "Unranked";
                        let game_lost = "Unranked";
                        let Winrate;
                        //REASON for this for: the api return 2 types of Queue (SOLO vs Other), and it is random sometimes.
                        for(var i = 0; i < 1; i++){
                            if(user_rank_data[i].queueType ==  "RANKED_SOLO_5x5"){
                                rank_data = user_rank_data[i];
                                break;
                            }
                        }
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
                        findDDragonVersion().then(
                            version => {
                                let player_info_embed = new Discord.MessageEmbed() 
                                .setColor('#0099ff')
                                .setTitle('Summoner Information')
                                .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${version[0]}/img/profileicon/${user_icon_id}.png`)
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
        ).catch(error => console.log(error))
    }

    //>------------------------------------------------------------------------------------------------------------------------
    //FIND MATCH HISTORY
    if(user_message[0] === `${BOT_PREFIX}${MATCH_HISTORY}`){
        //encode URL of the player name to be sent to the API
        league_user_name = encodeURIComponent(getLeagueUserName(user_message));
        //Create URL
        let league_api_SUMMONERV4_url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${league_user_name}?api_key=${process.env.RIOT_TOKEN}`;
        findUserInfo(league_api_SUMMONERV4_url).then(
            summoner_data => {
                let league_api_MATCHV5byPuuid_url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner_data.puuid}/ids?start=0&count=5&api_key=${process.env.RIOT_TOKEN}`;
                findMatchIdByPuuid(league_api_MATCHV5byPuuid_url).then(
                    match_id_list =>{
                        console.log(match_id_list);
                        for(var i = 0; i < 5; i++ ){ //this for loop is to loop through all the matches the api return
                            let league_api_MATCHV5byMatchId = `https://americas.api.riotgames.com/lol/match/v5/matches/${match_id_list[i]}?api_key=${process.env.RIOT_TOKEN}`;
                            findMatchHistoryById(league_api_MATCHV5byMatchId).then(
                                match_data =>{
                                    if(match_data.status == null){ //sometimes the api returns error code with key is "status", if no error, status key does not exist
                                        let correct_user_puuid = summoner_data.puuid;
                                        let game_mode;
                                        let position;
                                        let nexus_lost;
                                        let champion_name;
                                        let champion_id;
                                        let kill;
                                        let death;
                                        let assist;
                                        let game_state;
                                        let multikill;

                                        for(var j = 0; j < 10; j++){ //this for loop is to loop through the participants in a match
                                        //TODO: Win or lost, ROLE, kda, Champion played + icon, gamemode
                                            if(match_data.info.participants[j] != null && match_data.info.participants[j].puuid == correct_user_puuid){
                                                let player_ = match_data.info.participants[j];
                                                game_mode = match_data.info.gameMode;
                                                nexus_lost = player_.nexusLost; //nexuslost = 1 is lost, else = 0  is win
                                                
                                                state = player_.win;
                                                champion_name = player_.championName;
                                                champion_id = player_.championId;
                                                kill = player_.kills;
                                                death = player_.deaths;
                                                assist = player_.assists;
                                                position = player_.individualPosition;
                                                multikill = player_.largestMultiKill;
                                            }
                                        }//end loop
                                        let multispree;
                                        switch(multikill){
                                            case 0:
                                                multispree = "NA";
                                                break;
                                            case 1:
                                                multispree = "SingleKill";
                                                break;
                                            case 2:
                                                multispree = "DoubleKill";
                                                break;
                                            case 3:
                                                multispree = "TripleKill";
                                                break;
                                            case 4:
                                                multispree = "QuadraKill";
                                                break;
                                            case 5:
                                                multispree = "PENTAKILL";
                                                break;
                                        }
                                        //get game state if won or defeated
                                        if(state === false){
                                            game_state = "Defeat";
                                        } else if(state === true){
                                            game_state = "Victory";
                                        }

                                        //create KDA string
                                        let kda = kill+"/"+death+"/"+assist;
                                        
                                        //get champion icon

                                        //there is a weird error from riot api that return weird champion id. Hard code this to get correct one. There maybe more than these 2 champions.
                                        //this maybe due to special skin icon.
                                        if(champion_name == "Lucian"){
                                            champion_id = 236;
                                        }
                                        if(champion_name == "Maokai"){
                                            champion_id = 57;
                                        }
                                        //source: https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/
                                        let champion_img = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champion_id}.png`
                                        
                                        //change game mode name
                                        if(game_mode == "CLASSIC"){
                                            game_mode = "Summoner's rift";
                                        } else if(game_mode == "ARAM"){
                                            game_mode = "Aram";
                                        }
                                        //choose the color for Discord embed message, blue for victory, red is for defeat
                                        let choose_color;
                                        if(game_state ==="Defeat" ){
                                            choose_color = "#FF0000";
                                        }
                                        else if(game_state === "Victory"){
                                            choose_color = "#189AB4";
                                        }
                                        if(position == "UTILITY"){
                                            position = "SUPPORT";
                                        }
                                        let match_embed = new Discord.MessageEmbed() 
                                        .setTitle(game_state)
                                        .setColor(choose_color)
                                        .setThumbnail(champion_img)
                                        .addField("Map",game_mode)
                                        .addFields(
                                            { name: 'Champion: ', value: champion_name},
                                            { name: 'KDA: ', value: kda, inline: true},
                                            { name: 'Position: ', value: position, inline: true},
                                            { name: 'Multikill: ', value: multispree, inline: true},
                                        )
                                        msg.channel.send(match_embed);

                                    }//end if
                                }
                            ).catch(error => console.log(error));
                        }//end loop
                    }
                ).catch(error => console.log(error));
            }
        ).catch(error => console.log(error));
    }

});

client.login(process.env.BOT_TOKEN);