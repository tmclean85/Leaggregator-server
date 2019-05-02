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
    res.status(200).send(matches)
  })

  async function getSummoner(name) {
    const summonerDetails = await kayn.Summoner.by.name(name)
    return summonerDetails
  };

  async function getMatches(id) {
    const matches = await kayn.Matchlist.by.accountID(id)
    return matches
  }

}