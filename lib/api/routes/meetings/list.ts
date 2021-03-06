import { NextApiRequest as Req, NextApiResponse as Res } from 'next';

import { APIError, handle } from 'lib/api/error';
import {
  MeetingJSON,
  MeetingsQuery,
  MeetingsQueryURL,
  isMeetingsQueryURL,
} from 'lib/model';
import getMeetings from 'lib/api/get/meetings';
import verifyAuth from 'lib/api/verify/auth';
import verifyQuery from 'lib/api/verify/query';

export interface ListMeetingsRes {
  meetings: MeetingJSON[];
  hits: number;
}

export default async function listMeetings(
  req: Req,
  res: Res<ListMeetingsRes>
): Promise<void> {
  try {
    const query = verifyQuery<MeetingsQuery, MeetingsQueryURL>(
      req.query,
      isMeetingsQueryURL,
      MeetingsQuery
    );

    // User must be either:
    // a) An org admin of the matches requested, OR;
    // b) The person whose matches are being requested.
    if (query.people.length !== 1 && !query.org)
      throw new APIError('You must filter meetings by org or people', 400);
    await verifyAuth(req.headers, {
      userId: query.people.length === 1 ? query.people[0].value : undefined,
      orgIds: query.org ? [query.org] : undefined,
    });

    const { results, hits } = await getMeetings(query);
    res.status(200).json({ hits, meetings: results.map((m) => m.toJSON()) });
  } catch (e) {
    handle(e, res);
  }
}
