const TeamConfiguration = require('./team-configuration');

class TeamConfigurationService {

  constructor(teamStore) {
    this.teamStore = teamStore;
  }

  get(teamId) {
    const teamStore = this.teamStore;
    return new Promise((resolve, reject) => {
      teamStore.get(teamId, function(err, team_data) {
        if (err) {
          reject(err);
        }

        if (!team_data || !team_data.configuration) {
          resolve(new TeamConfiguration());
        } else {
          resolve(new TeamConfiguration(team_data.configuration));
        }
      });
    });
  }

  save(teamId, teamConfiguration) {
    const teamStore = this.teamStore;
    return new Promise((resolve, reject) => {
      const data = {
        id: teamId,
        configuration: teamConfiguration.getAsObject(),
      };

      teamStore.save(data, function(err, id) {
        if (err) {
          reject(err);
        }

        resolve(id);
      });
    });
  }

}

module.exports = TeamConfigurationService;
