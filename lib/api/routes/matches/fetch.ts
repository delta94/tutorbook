import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

import { MatchJSON } from 'lib/model';
import { handle } from 'lib/api/error';
import getMatch from 'lib/api/get/match';
import verifyAuth from 'lib/api/verify/auth';
import verifyQueryId from 'lib/api/verify/query-id';

export type FetchMatchRes = MatchJSON;

export default async function fetchMatch(
  req: Req,
  res: Res<FetchMatchRes>
): Promise<void> {
  try {
    const id = verifyQueryId(req.query);
    const match = await getMatch(id);

    await verifyAuth(req.headers, {
      userIds: match.people.map((p) => p.id),
      orgIds: [match.org],
    });

    res.status(200).json(match.toJSON());
  } catch (e) {
    handle(e, res);
  }
}
