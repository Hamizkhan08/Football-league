/**
 * Compute standings from a list of completed/live matches and teams.
 * Returns an array of standing objects sorted by Points desc, then GD desc.
 */
export function computeStandings(teams, matches) {
  const table = {}

  // Initialize rows
  teams.forEach(team => {
    table[team.id] = {
      team,
      mp: 0,  // matches played
      w:  0,  // wins
      d:  0,  // draws
      l:  0,  // losses
      gf: 0,  // goals for
      ga: 0,  // goals against
      gd: 0,  // goal difference
      pts: 0, // points
    }
  })

  // Process matches
  matches.forEach(match => {
    if (match.status !== 'completed' && match.status !== 'live') return

    const a = table[match.team_a_id]
    const b = table[match.team_b_id]
    if (!a || !b) return

    const sa = match.score_a ?? 0
    const sb = match.score_b ?? 0

    // Count played
    a.mp++
    b.mp++
    a.gf += sa; a.ga += sb
    b.gf += sb; b.ga += sa

    if (sa > sb) {
      a.w++; b.l++
      a.pts += 3
    } else if (sa < sb) {
      b.w++; a.l++
      b.pts += 3
    } else {
      a.d++; b.d++
      a.pts += 1; b.pts += 1
    }

    a.gd = a.gf - a.ga
    b.gd = b.gf - b.ga
  })

  return Object.values(table).sort((x, y) => {
    if (y.pts !== x.pts) return y.pts - x.pts
    if (y.gd  !== x.gd)  return y.gd  - x.gd
    return y.gf - x.gf
  })
}
