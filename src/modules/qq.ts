import { StreamMapperFunction, TricodeMapper, doRequest, CacheOptions } from "../lib/utils.ts";
import { League } from "../lib/leagues.ts";
import { Match, MatchState } from "../lib/matches.ts";

type QQTeam = {
  teamId: number,
  teamSpName: string,
  teamName: string,
  teamShortName: string,
};

type QQMatch = {
  bMatchId: number,
  matchDate: string,
  scoreA: number,
  scoreB: number,
  teamAId: number,
  teamBId: number,
  matchFormat: string, // string is "BOX" where X is BO#
  teamA: QQTeam,
  teamB: QQTeam,
  matchType: string,
  matchMode: string,
  matchStatusId: number, // 1 = upcoming, 2 = current, 3 = finished
}

const matchSortFn = (a: QQMatch, b: QQMatch) => {
  return new Date(a.matchDate) > new Date(b.matchDate) ? 1 : -1;
}

// This module should only really be used for china gc since it doesn't show
// on valorantesports.com. It lists all VCT games as well, which will be
// duplicated if the valesports module is used as well. Because of that, I
// haven't added logic for translating the "SecondLevelGame" field returned
// by the site to leagues as understood by the bot. If needed, though, it could
// be done at a later time.
export async function getQQ(
  id: number, // "SecondLevelGame" match details to fetch from the site
  league: League,
  streamMapperFn?: StreamMapperFunction,
): Promise<Match[]> {
  const matches: Match[] = [];
  const url = new URL(`https://val.native.game.qq.com/esports/v1/data/VAL_Match_${id}.json`);
  const standings: { [key: number]: { w: number, l: number } } = {}; // key is team id

  const data = (await doRequest(url)).msg;
  // maybe i should just reverse()?
  data.sort(matchSortFn).forEach((match: QQMatch) => {
    const startTime = new Date(match.matchDate);
    let state: MatchState;
    if (match.matchStatusId === 1 && startTime > new Date()) {
      state = 'upcoming';
    } else if (match.matchStatusId === 3) {
      state = 'completed';
    } else {
      state = 'live';
    }
    const newMatch: Match = {
      league: league,
      startTime: startTime,
      state: state,
    };

    if (match.matchFormat) {
      const bo = parseInt(/BO(\d)/.exec(match.matchFormat)![1]);
      newMatch.strategy = {
        type: 'bestOf',
        count: bo,
      };
      const numNeeded = Math.ceil(bo / 2);
      if (match.scoreA === numNeeded || match.scoreB === numNeeded) {
        newMatch.state = 'completed';
      }

      if (standings[match.teamAId] === undefined) {
        standings[match.teamAId] = { w: 0, l: 0 };
      }
      if (standings[match.teamBId] === undefined) {
        standings[match.teamBId] = { w: 0, l: 0 };
      }

      // if match is complete
      if (match.matchStatusId === 3) {
        const neededMaps = Math.round(bo / 2);
        if (match.scoreA === neededMaps) {
          standings[match.teamAId].w = standings[match.teamAId].w + 1;
          standings[match.teamBId].l = standings[match.teamBId].l + 1;
        } else {
          standings[match.teamBId].w = standings[match.teamBId].w + 1;
          standings[match.teamAId].l = standings[match.teamAId].l + 1;
        }
        // return;
      }

    }

    if (match.teamAId) {
      newMatch.teamA = {
        name: match.teamA.teamName,
        code: match.teamA.teamShortName,
        result: {
          mapWins: match.scoreA,
        }
      }
      if (standings[match.teamAId]) {
        newMatch.teamA.record = {
          wins: standings[match.teamAId].w,
          losses: standings[match.teamAId].l,
        }
      }
    }

    if (match.teamBId) {
      newMatch.teamB = {
        name: match.teamB.teamName,
        code: match.teamB.teamShortName,
        result: {
          mapWins: match.scoreB,
        }
      }
      if (standings[match.teamBId]) {
        newMatch.teamB.record = {
          wins: standings[match.teamBId].w,
          losses: standings[match.teamBId].l,
        }
      }
    }

    if (streamMapperFn) {
      const stream = streamMapperFn(newMatch.teamA, newMatch.teamB);
      if (stream) {
        newMatch.stream = new URL(stream);
      }
    }

    matches.push(newMatch);
  });
  return matches;
}