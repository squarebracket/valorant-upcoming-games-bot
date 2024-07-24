import { League } from "../lib/leagues.ts";
import { BestOfStrategy, Match } from "../lib/matches.ts";
import { StreamMapperFunction, TricodeMapper, doRequest } from "../lib/utils.ts";
import * as config from '../config.ts';

type ChallongeRound = {
  best_of: number;
  href: string;
}

type ChallongeTeam = {
  participant: {
    active: boolean;
    display_name: string;
    id: number;
    portrait_url: string;
  }
}

type ChallongeMatch = {
  match: {
    attachment_count?: number;
    is_group_match: boolean;
    // player1: ChallongeTeam;
    // player2: ChallongeTeam;
    player1_id: number;
    player2_id: number;
    round: number;
    scheduled_time: string | null;
    scores_csv: string;
    started_at?: string;
    state: 'pending' | 'open' | 'complete';
    underway_at: string | null;
    winner_id: number | null;
    loser_id: number | null;
  }
}

type ChallongeTournament = {
  tournament: {
    start_at?: string;
    state: 'pending' | 'awaiting_review' | 'underway';
    tournament_type: 'swiss' | 'single elimination' | 'double elimination';
    swiss_rounds: number;
    participants: ChallongeTeam[];
    matches: ChallongeMatch[];
  }
}

export type StartTimeMapper = (match: ChallongeMatch, tourney: ChallongeTournament) => Date;

export async function getChallonge(
  tournament: number | string,
  league: League,
  tricodeMapper: TricodeMapper,
  startTimeMapper: StartTimeMapper,
  streamMapperFn?: StreamMapperFunction,
): Promise<Match[]> {
  const apiKey = config['challongeApiKey'];
  const username = config['challongeUsername'];
  if (!username || !apiKey) {
    console.error('NO API KEY');
    return [];
  }

  const url = new URL(`https://${username}:${apiKey}@api.challonge.com/v1/tournaments/${tournament}.json?include_participants=1&include_matches=1`);
  const data: ChallongeTournament = (await doRequest(url));
  // data.tournament.start_at = "2024-03-26T05:00:00.000-07:00";

  if (!data.tournament.matches.length) {
    // make a fake match since they don't release bracket until just before
    const newMatch: Match = {
      league: league,
      startTime: new Date(data.tournament.start_at),
      state: "upcoming",
    }
    return [newMatch];
  }

  const matches: Match[] = [];
  const standings: { [key: number]: {w: number, l: number}} = {};
  let latestRound: number = 0;

  data.tournament.matches.forEach((m) => {
    //data.tournament.matches.forEach((m) => {
    const match = m.match;
    //match.started_at = undefined;
    latestRound = Math.max(latestRound, match.round);

    if (standings[match.player1_id] === undefined) {
      standings[match.player1_id] = {w: 0, l: 0};
    }
    if (standings[match.player2_id] === undefined) {
      standings[match.player2_id] = {w: 0, l: 0};
    }

    if (match.state === 'complete') {
      // sometimes, when both teams FF, the match will be set to complete but
      // there will be no winner/loser...
      if (match.winner_id !== null && match.loser_id !== null) {
        standings[match.winner_id].w = standings[match.winner_id].w + 1;
        standings[match.loser_id].l = standings[match.loser_id].l + 1;
      } else {
        standings[match.player1_id].l = standings[match.player1_id].l + 1;
        standings[match.player2_id].l = standings[match.player2_id].l + 1;
      }
      return;
    }

    const startTime = match.scheduled_time ? new Date(match.scheduled_time) : startTimeMapper(m, data);

    const newMatch: Match = {
      league: league,
      startTime: startTime,
      state: (match.started_at && new Date() > startTime) ? 'live' : 'upcoming',
    };

    const mapScores = (match.scores_csv ?? '').split(',').reduce((prev, cur) => {
      let [allP1, allP2] = prev;
      const [thisP1, thisP2] = cur.split('-');
      if (cur.trim() === '' || thisP1 === thisP2) {
        return [allP1, allP2];
      }
      return parseInt(thisP1) > parseInt(thisP2) ? [allP1 + 1, allP2] : [allP1, allP2 + 1];
    }, [0, 0]);

    const team1 = data.tournament.participants.find(t => t.participant.id === match.player1_id);
    if (team1) {
      newMatch.teamA = {
        name: team1.participant.display_name,
        code: tricodeMapper[team1.participant.display_name] || team1.participant.display_name,
        record: {
          wins: standings[match.player1_id].w,
          losses: standings[match.player1_id].l,
        },
        result: {
          mapWins: mapScores[0]
        }
      };
    }

    const team2 = data.tournament.participants.find(t => t.participant.id === match.player2_id);
    if (team2) {
      newMatch.teamB = {
        name: team2.participant.display_name,
        code: tricodeMapper[team2.participant.display_name] || team2.participant.display_name,
        record: {
          wins: standings[match.player2_id].w,
          losses: standings[match.player2_id].l,
        },
        result: {
          mapWins: mapScores[1]
        }
      };
    }

    if (streamMapperFn) {
      const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
      if (stream) {
        newMatch.stream = new URL(stream);
      }
    }

    matches.push(newMatch);

  });

  for (let i = latestRound; i < data.tournament.swiss_rounds; i++) {
    const newMatch: Match = {
      league: league,
      // @ts-ignore
      startTime: startTimeMapper({match: {round: i+1}}, data),
      state: "upcoming",
    }
    matches.push(newMatch);
  }

  return matches;
}