import { getLeagueByName, League } from "../../lib/leagues.ts";
import { Match, Team } from "../../lib/matches.ts";
import { getLiquipedia } from "../liquipedia.ts";

export async function getMatches(): Promise<Match[]> {
  try {
    // const vctCN = await getLeagueByName('VCT CN');
    // const vctPac = await getLeagueByName('VCT Pacific');
    // const vctEMEA = await getLeagueByName('VCT EMEA');
    // const vctAmer = await getLeagueByName('VCT Americas');
    // const vctMasters = await getLeagueByName('VALORANT Masters');
    const gcEMEA = await getLeagueByName('Game Changers EMEA');
    const gcBR = await getLeagueByName('Game Changers BR');
    // const vcb = await getLeagueByName('Challengers BR');
    const gcNA = await getLeagueByName('Game Changers NA');
    const gcLatam = await getLeagueByName('Game Changers LATAM');
    const gcKr = await getLeagueByName('Game Changers KR');
    const gcJp = await getLeagueByName('Game Changers JPN');
    const gcCn = await getLeagueByName('Game Changers China');
    const gcSA = await getLeagueByName('Game Changers South Asia');
    const vclNA = await getLeagueByName('Challengers NA');
    if (gcJp === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    if (gcKr === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    if (gcLatam === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    if (gcNA === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    if (gcBR === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    if (gcEMEA === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    if (gcCn === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    if (gcSA === undefined) {
      console.error(`can't find league`);
      throw new Error("can't find league");
    }
    const tourneys = [
      'VCT 2025: Game Changers Korea Split 1',
      'VCT 2025: Game Changers China Stage 1',
      'VCT 2025: Game Changers EMEA Stage 2',
    ];
    const leagueMapper = (tournament: string): League => {
      if (tournament.includes('Korea')) {
        return gcKr;
      } else if (tournament.includes('EMEA')) {
        return gcEMEA;
      } else {
        return gcCn;
      }
    }
    return getLiquipedia(tourneys, leagueMapper);
  } catch {
    return [];
  }
}