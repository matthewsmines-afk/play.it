
import { Team } from '@/entities/Team';
import { Player } from '@/entities/Player';
import { PlayerSeasonContribution } from '@/entities/PlayerSeasonContribution';
import { SeasonRollover } from '@/entities/SeasonRollover';

// Season management utilities
export class SeasonManager {
  
  // Get current season based on date and sport
  static getCurrentSeason(date = new Date(), sport = 'football', country = 'UK') {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-indexed to 1-indexed
    
    // UK Football: Season runs Sept 1st - Aug 31st
    // So Sept-Dec = 2024/25, Jan-Aug = 2024/25 (same season)
    if (sport === 'football' && country === 'UK') {
      if (month >= 9) {
        // September onwards = new season starting
        return `${year}/${(year + 1).toString().slice(2)}`;
      } else {
        // Jan-Aug = previous year's season  
        return `${year - 1}/${year.toString().slice(2)}`;
      }
    }
    
    // Default fallback
    return `${year}/${(year + 1).toString().slice(2)}`;
  }

  // Check if today is a season rollover date
  static isSeasonRolloverDate(date = new Date(), sport = 'football', country = 'UK') {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (sport === 'football' && country === 'UK') {
      return month === 9 && day === 1; // September 1st
    }
    
    return false;
  }

  // Get the next rollover date
  static getNextRolloverDate(sport = 'football', country = 'UK') {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    if (sport === 'football' && country === 'UK') {
      const nextSept1 = new Date(currentYear, 8, 1); // Month 8 = September
      
      if (now > nextSept1) {
        // Already passed this year's Sept 1, so next year
        return new Date(currentYear + 1, 8, 1);
      } else {
        return nextSept1;
      }
    }
    
    return new Date(currentYear + 1, 0, 1); // Default Jan 1st
  }

  // Suggest age group increment - UPDATED to handle new format
  static suggestAgeGroupUpdate(currentAgeGroup) {
    // Handle U4-U23 format
    const ageMatch = currentAgeGroup.match(/U(\d+)/);
    if (ageMatch) {
      const currentAge = parseInt(ageMatch[1]);
      const newAge = currentAge + 1;
      
      // U23 graduates to Senior
      if (currentAge === 23) {
        return 'Senior';
      }
      
      return `U${newAge}`;
    }
    
    // Senior and Mixed Age don't change
    if (currentAgeGroup === 'Senior' || currentAgeGroup === 'Mixed Age') {
      return currentAgeGroup;
    }
    
    return currentAgeGroup;
  }

  // Archive current season stats for all players in a team
  static async archiveSeasonStats(teamId, season) {
    try {
      const players = await Player.filter({
        team_memberships: {
          '$elemMatch': { team_id: teamId, is_active: true }
        }
      });

      const archivePromises = players.map(async (player) => {
        // Get current career stats as season contribution
        const seasonStats = {
          goals: player.career_stats?.goals || 0,
          assists: player.career_stats?.assists || 0,
          games_played: player.career_stats?.games_played || 0,
          tackles: player.career_stats?.tackles || 0,
          saves: player.career_stats?.saves || 0,
          minutes_played: player.career_stats?.minutes_played || 0,
          man_of_the_match_awards: player.career_stats?.man_of_the_match_awards || 0
        };

        // Create season contribution record
        await PlayerSeasonContribution.create({
          player_id: player.id,
          team_id: teamId,
          season: season,
          stats: seasonStats
        });

        // Reset career stats for new season (keep total but start fresh for current season tracking)
        // Note: This assumes career_stats represents "current season" stats
        // Total career will be calculated by summing all PlayerSeasonContributions
        await Player.update(player.id, {
          career_stats: {
            goals: 0,
            assists: 0,
            games_played: 0,
            tackles: 0,
            saves: 0,
            minutes_played: 0,
            man_of_the_match_awards: 0
          }
        });
      });

      await Promise.all(archivePromises);
      return true;
    } catch (error) {
      console.error('Error archiving season stats:', error);
      return false;
    }
  }

  // Process season rollover for all teams
  static async processSeasonRollover() {
    const currentDate = new Date();
    const newSeason = this.getCurrentSeason(currentDate);
    const previousSeason = this.getPreviousSeason(newSeason);

    try {
      // Get all teams
      const teams = await Team.list();
      const teamUpdates = [];

      for (const team of teams) {
        // Archive stats for previous season
        await this.archiveSeasonStats(team.id, previousSeason);

        // Suggest age group update
        const suggestedAgeGroup = this.suggestAgeGroupUpdate(team.age_group);
        
        if (suggestedAgeGroup !== team.age_group) {
          teamUpdates.push({
            team_id: team.id,
            old_age_group: team.age_group,
            new_age_group: suggestedAgeGroup,
            coach_confirmed: false
          });
        }
      }

      // Create rollover record
      await SeasonRollover.create({
        season: newSeason,
        rollover_date: currentDate.toISOString().split('T')[0],
        teams_affected: teams.map(t => t.id),
        age_group_updates: teamUpdates,
        stats_archived: true
      });

      return {
        success: true,
        season: newSeason,
        teamsAffected: teams.length,
        ageGroupUpdates: teamUpdates.length
      };

    } catch (error) {
      console.error('Error processing season rollover:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper: get previous season
  static getPreviousSeason(currentSeason) {
    const [startYear, endYear] = currentSeason.split('/');
    const prevStart = (parseInt(startYear) - 1).toString();
    const prevEnd = (parseInt('20' + endYear) - 1).toString().slice(2);
    return `${prevStart}/${prevEnd}`;
  }

  // Get all season contributions for a player (for career totals)
  static async getPlayerCareerTotals(playerId) {
    try {
      const contributions = await PlayerSeasonContribution.filter({ player_id: playerId });
      
      const totals = contributions.reduce((acc, contribution) => {
        const stats = contribution.stats || {};
        return {
          goals: acc.goals + (stats.goals || 0),
          assists: acc.assists + (stats.assists || 0),
          games_played: acc.games_played + (stats.games_played || 0),
          tackles: acc.tackles + (stats.tackles || 0),
          saves: acc.saves + (stats.saves || 0),
          minutes_played: acc.minutes_played + (stats.minutes_played || 0),
          man_of_the_match_awards: acc.man_of_the_match_awards + (stats.man_of_the_match_awards || 0)
        };
      }, {
        goals: 0, assists: 0, games_played: 0, tackles: 0, 
        saves: 0, minutes_played: 0, man_of_the_match_awards: 0
      });

      return totals;
    } catch (error) {
      console.error('Error calculating career totals:', error);
      return {
        goals: 0, assists: 0, games_played: 0, tackles: 0,
        saves: 0, minutes_played: 0, man_of_the_match_awards: 0
      };
    }
  }

  // Update player stats after a match
  static async updatePlayerMatchStats(playerId, teamId, matchStats) {
    const currentSeason = this.getCurrentSeason();

    try {
      // Update current season stats in career_stats (represents current season)
      const player = await Player.get(playerId);
      const currentStats = player.career_stats || {};

      const updatedStats = {
        goals: (currentStats.goals || 0) + (matchStats.goals || 0),
        assists: (currentStats.assists || 0) + (matchStats.assists || 0),
        games_played: (currentStats.games_played || 0) + 1, // Always increment games
        tackles: (currentStats.tackles || 0) + (matchStats.tackles || 0),
        saves: (currentStats.saves || 0) + (matchStats.saves || 0),
        minutes_played: (currentStats.minutes_played || 0) + (matchStats.minutes_played || 0),
        man_of_the_match_awards: (currentStats.man_of_the_match_awards || 0) + (matchStats.is_motm ? 1 : 0)
      };

      await Player.update(playerId, { career_stats: updatedStats });

      // Also update/create current season contribution
      let seasonContribution = await PlayerSeasonContribution.filter({
        player_id: playerId,
        team_id: teamId, 
        season: currentSeason
      });

      if (seasonContribution.length === 0) {
        // Create new season contribution
        await PlayerSeasonContribution.create({
          player_id: playerId,
          team_id: teamId,
          season: currentSeason,
          stats: matchStats
        });
      } else {
        // Update existing season contribution
        const existing = seasonContribution[0];
        const existingStats = existing.stats || {};

        const updatedSeasonStats = {
          goals: (existingStats.goals || 0) + (matchStats.goals || 0),
          assists: (existingStats.assists || 0) + (matchStats.assists || 0),
          games_played: (existingStats.games_played || 0) + 1,
          tackles: (existingStats.tackles || 0) + (matchStats.tackles || 0),
          saves: (existingStats.saves || 0) + (matchStats.saves || 0),
          minutes_played: (existingStats.minutes_played || 0) + (matchStats.minutes_played || 0),
          man_of_the_match_awards: (existingStats.man_of_the_match_awards || 0) + (matchStats.is_motm ? 1 : 0)
        };

        await PlayerSeasonContribution.update(existing.id, {
          stats: updatedSeasonStats
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating player match stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default SeasonManager;
