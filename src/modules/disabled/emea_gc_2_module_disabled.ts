import { parse } from 'node-html-parser';
import { doRequest } from '../lib/utils.ts';

export async function getMatches() {
  const html = await doRequest(new URL('https://vctgcemea.com/tournament/detail/vct-game-changers-emea:-stage-1-group-stage'), false);
  const root = parse(html);
  const matches = root.querySelectorAll('#matches div.card-body div.card-body div.row.mb-3');
  // console.log(matches);
  matches.forEach((matchEl) => {
    
    const teamA = matchEl.querySelectorAll('.team1 span')[0]!.innerText.trim();
    const teamAScore = matchEl.querySelectorAll('.score span')[0].innerText.trim();
    const teamB = matchEl.querySelectorAll('.team1 span')[1]!.innerText.trim();
    const teamBScore = matchEl.querySelectorAll('.score span')[2].innerText.trim();
    // console.log(teamA, teamAScore, '-', teamBScore, teamB);
  });
  const leaderboards = root.querySelector('#leaderboard')!.querySelectorAll('table')!;
  return [];
}