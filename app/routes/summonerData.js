module.exports = function(app) {

  const { Kayn, REGIONS } = require('kayn')
  const kayn = Kayn(/********API KEY********/)({
    region: REGIONS.NORTH_AMERICA,
    locale: 'en_US',
    debugOptions: {
      isEnabled: true,
      showKey: false,
    },
    requestOptions: {
      shouldRetry: true,
      numberOfRetriesBeforeAbort: 3,
      delayBeforeRetry: 1000,
    }
  });

  app.get('/', async (req, res) => {
    const player = req.query.summoner;
    const summoner = await getSummoner(player);
    const matches = await getMatches(summoner.accountId)
    const trimmedMatches = trimData(matches.matches)
    const matchesData = await getMatchData(player, trimmedMatches)
    res.status(200).send(matchesData)
  })

  // helpers will hit API endpoints for summoner and match data, as well as trim match data

  async function getSummoner(name) {
    try {
      const summonerDetails = await kayn.Summoner.by.name(name)
      return summonerDetails
    } catch(e) {
      console.log(e)
    }
  };

  async function getMatches(id) {
    try {
      const matches = await kayn.Matchlist.by.accountID(id)
      return matches
    } catch(e) {
      console.log(e)
    }
  }

  // async function getTimeline(id) {
  //   const timeline = await kayn.Match.timeline(id)
  //   return timeline
  // }

  function trimData(matchData) {
    try {
      let matchArr = [];
      for(let i = 0; i < 10; i++) {
        if(matchData[i])matchArr.push(matchData[i])
      }
      return matchArr
    } catch(e) {
      console.log(e)
    }
  }

  async function getMatchData(name, matchArray) {
    let dataArr = [];
    try {
      for (let i = 0, len = matchArray.length; i < len; i++) {
        let thisMatch = await kayn.Match.get(matchArray[i].gameId);
        // compare summoner name against names from participant data to determine summoner's participant ID
        let participantId = thisMatch.participantIdentities.filter((participants) => {
          return participants.player.summonerName === name;
        })
        // compare summoner's participant ID against match data participant ID to retrieve summoner's match data
        let matchData = thisMatch.participants.filter((participants) => {
          return participants.participantId === participantId[0].participantId
        })
        // let timeline = await kayn.Match.timeline(matchArray[i].gameId)
        // console.log('timeline', timeline)
        dataArr.push({ matchId: matchArray[i].gameId, matchData: matchData})
      }
      return dataArr;
    } catch(e) {
      console.log(e)
    }
  }

}