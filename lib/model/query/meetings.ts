import {
  MatchesQuery,
  MatchesQueryInterface,
  MatchesQueryJSON,
  isMatchesQueryURL,
} from 'lib/model/query/matches';
import construct from 'lib/model/construct';

export interface MeetingsQueryInterface extends MatchesQueryInterface {
  from: Date;
  to: Date;
}

export type MeetingsQueryJSON = Omit<
  MeetingsQueryInterface,
  keyof MatchesQueryInterface | 'from' | 'to'
> &
  MatchesQueryJSON & { from: string; to: string };

export type MeetingsQueryURL = {
  [key in keyof MeetingsQueryInterface]?: string;
};

// TODO: Implement this to verify that the given query params are valid.
export function isMeetingsQueryURL(query: unknown): query is MeetingsQueryURL {
  return isMatchesQueryURL(query);
}

export class MeetingsQuery extends MatchesQuery
  implements MeetingsQueryInterface {
  public from: Date = new Date();

  public to: Date = new Date();

  public constructor(query: Partial<MeetingsQueryInterface> = {}) {
    super(query);
    construct<MeetingsQueryInterface, MatchesQueryInterface>(
      this,
      query,
      new MatchesQuery()
    );
  }

  protected getURLQuery(): Record<string, string | number | boolean> {
    const query = super.getURLQuery();
    query.from = this.from.toJSON();
    query.to = this.to.toJSON();
    return query;
  }

  public static fromURLParams(params: MeetingsQueryURL): MeetingsQuery {
    return new MeetingsQuery({
      ...MatchesQuery.fromURLParams(params),
      from: new Date(params.from || new Date().toJSON()),
      to: new Date(params.to || new Date().toJSON()),
    });
  }

  public get endpoint(): string {
    return this.getURL('/api/meetings');
  }

  public static fromJSON(json: MeetingsQueryJSON): MeetingsQuery {
    return new MeetingsQuery({
      ...MatchesQuery.fromJSON(json),
      from: new Date(json.from),
      to: new Date(json.to),
    });
  }
}
