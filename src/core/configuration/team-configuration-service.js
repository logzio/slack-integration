const TeamConfiguration = require('./team-configuration');

class TeamConfigurationService {

  constructor(teamStore) {
    this.teamStore = teamStore;
  }

  get(teamId) {
    return this.teamStore.get(teamId)
      .then(teamDate => {
        if (!teamDate || !teamDate.bot.configuration) {
          return new TeamConfiguration();
        } else {
          return new TeamConfiguration(teamDate.bot.configuration);
        }
      });
  }

  save(teamId, teamConfiguration) {
    const teamStore = this.teamStore;
    return teamStore.get(teamId)
      .then(currentTeamData => {
        const { bot } = currentTeamData;
        const updatedTeamData = {
          ...currentTeamData,
          bot: {
            ...bot,
            configuration: teamConfiguration.getAsObject(),
          }
        };

        return teamStore.save(updatedTeamData);
      });
  }

}

module.exports = TeamConfigurationService;
