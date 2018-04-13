const TeamConfiguration = require('./team-configuration');

class TeamConfigurationService {

  constructor(teamStore) {
    this.teamStore = teamStore;
  }

  get(teamId) {
    return this.teamStore.get(teamId)
      .then(teamDate => {
        if (!teamDate || !teamDate.configuration) {
          return new TeamConfiguration();
        } else {
          return new TeamConfiguration(teamDate.configuration);
        }
      });
  }

  save(teamId, teamConfiguration) {
    const teamStore = this.teamStore;
    return teamStore.get(teamId)
      .then(currentTeamData => {
        const updatedTeamData = {
          ...currentTeamData,
          configuration: teamConfiguration.getAsObject(),
        };

        return teamStore.save(updatedTeamData);
      });
  }

}

module.exports = TeamConfigurationService;
