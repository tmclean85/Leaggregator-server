module.exports = function(app) {

  const { Kayn, REGIONS } = require('kayn')
  const kayn = Kayn('RGAPI-2a66f04c-0517-4307-9012-108f1b405ba8')({
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
    const trimmedMatches = await trimData(matches.matches)
    const matchesData = await getMatchData(player, trimmedMatches)
    res.status(200).send(matchesData)
  })

  async function getSummoner(name) {
    const summonerDetails = await kayn.Summoner.by.name(name)
    return summonerDetails
  };

  async function getMatches(id) {
    const matches = await kayn.Matchlist.by.accountID(id)
    return matches
  }

  async function trimData(matchData) {
    let matchArr = [];
    for(let i = 0; i < 5; i++) {
      if(matchData[i])matchArr.push(matchData[i])
    }
    return matchArr
  }

  async function getMatchData(name, matchArray) {
    // console.log('name: ', name)
    // console.log('data: ', matchArray)
    let dataArr = [];
    for (let i = 0, len = matchArray.length; i < len; i++) {
      let thisMatch = await kayn.Match.get(matchArray[i].gameId);
      // compare summoner name against names from participant data to determine summoner's participant ID
      let participantId = thisMatch.participantIdentities.filter((participants) => {
        // console.log('data: ', participants)
        return participants.player.summonerName === name;
      })
      // compare summoner's participant ID against match data participant ID to retrieve summoner's match data
      let matchData = thisMatch.participants.filter((participants) => {
        // console.log('data: ', participants)
        return participants.participantId === participantId[0].participantId
      })
      dataArr.push({ matchId: matchArray[i].gameId, matchData: matchData })
    }
    return dataArr;
  }

}