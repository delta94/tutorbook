import * as admin from 'firebase-admin';
import { ObjectWithObjectID } from '@algolia/client-search';
import { v4 as uuid } from 'uuid';

import { Person, isPerson } from 'lib/model/person';
import {
  Resource,
  ResourceFirestore,
  ResourceInterface,
  ResourceJSON,
  ResourceSearchHit,
  isResourceJSON,
} from 'lib/model/resource';
import { Aspect } from 'lib/model/aspect';
import construct from 'lib/model/construct';
import firestoreVals from 'lib/model/firestore-vals';
import { isJSON } from 'lib/model/json';

type DocumentData = admin.firestore.DocumentData;
type DocumentSnapshot = admin.firestore.DocumentSnapshot;
type DocumentReference = admin.firestore.DocumentReference;

/**
 * The different states of a match or request.
 * @enum {string} MatchStatus
 * @property new - When the match is first created; a match stays in the `new`
 * state for at least a week after it's been created until it is either moved to
 * `active` or `stale`.
 * @property active - When the people in the match are actively meeting on a
 * regular, recurring basis (e.g once a week, they have tutoring lessons after
 * school for ~60mins). This is the ideal state of the match.
 * @property stale - When the people in the match have not met or have ceased
 * communications for over a week. A stale match needs re-engagement or should
 * be deleted.
 * @todo Is this property really necessary/valuable? If so, expose it in the UX.
 */
export type MatchStatus = 'new' | 'active' | 'stale';

/**
 * Represents a tutoring lesson or mentoring appointment.
 * @typedef {Object} MatchInterface
 * @property status - The status of the match (`new`, `active`, or `stale`).
 * @property org - The ID of the organization that owns this request or match.
 * @property subjects - The subjects that this match is about (e.g. AP CS).
 * @property people - The people involved in this match (i.e. pupil and tutor).
 * @property creator - The person who created this match (e.g. pupil or admin).
 * @property message - A more detailed description of this match or request.
 */
export interface MatchInterface extends ResourceInterface {
  status: MatchStatus;
  org: string;
  subjects: string[];
  people: Person[];
  creator: Person;
  message: string;
  ref?: DocumentReference;
  id: string;
}

export type MatchJSON = Omit<MatchInterface, keyof ResourceInterface> &
  ResourceJSON;
export type MatchSearchHit = ObjectWithObjectID &
  Omit<MatchInterface, keyof ResourceInterface> &
  ResourceSearchHit;
export type MatchFirestore = Omit<MatchInterface, keyof ResourceInterface> &
  ResourceFirestore;

export interface MatchSegment {
  message: string;
  subjects: string[];
}

export function isMatchJSON(json: unknown): json is MatchJSON {
  if (!isResourceJSON(json)) return false;
  if (!isJSON(json)) return false;
  if (typeof json.status !== 'string') return false;
  if (!['new', 'active', 'stale'].includes(json.status)) return false;
  if (typeof json.org !== 'string') return false;
  if (!(json.subjects instanceof Array)) return false;
  if (json.subjects.some((s) => typeof s !== 'string')) return false;
  if (!(json.people instanceof Array)) return false;
  if (json.people.some((p) => !isPerson(p))) return false;
  if (!isPerson(json.creator)) return false;
  if (typeof json.message !== 'string') return false;
  if (typeof json.id !== 'string') return false;
  return true;
}

export class Match extends Resource implements MatchInterface {
  public status: MatchStatus = 'new';

  public org = 'default';

  public subjects: string[] = [];

  public people: Person[] = [];

  public creator: Person = {
    id: '',
    name: '',
    photo: '',
    handle: uuid(),
    roles: [],
  };

  public message = '';

  public ref?: DocumentReference;

  public id = '';

  public constructor(match: Partial<MatchInterface> = {}) {
    super(match);
    construct<MatchInterface, ResourceInterface>(this, match, new Resource());
  }

  public get aspect(): Aspect {
    const isTutor = (a: Person) => a.roles.indexOf('tutor') >= 0;
    const isTutee = (a: Person) => a.roles.indexOf('tutee') >= 0;
    if (this.people.some((a) => isTutor(a) || isTutee(a))) return 'tutoring';
    return 'mentoring';
  }

  public toJSON(): MatchJSON {
    const { ref, ...rest } = this;
    return { ...rest, ...super.toJSON() };
  }

  public static fromJSON(json: MatchJSON): Match {
    return new Match({ ...json, ...Resource.fromJSON(json) });
  }

  public toFirestore(): MatchFirestore {
    const { ref, ...rest } = this;
    // TODO: Update the `firestoreVals` type definition (so it returns the
    // `MatchFirestore` object) and use it everywhere in `toFirestore` methods.
    return firestoreVals({ ...rest, ...super.toFirestore() }) as MatchFirestore;
  }

  // TODO: Decide whether these Firestore conversion methods should accept a
  // `DocumentSnapshot` or the actual object itself (as `Resource` does).
  public static fromFirestore(snapshot: DocumentSnapshot): Match {
    const data: DocumentData | undefined = snapshot.data();
    if (data) {
      return new Match({
        ...data,
        ...Resource.fromFirestore(data as ResourceFirestore),
        ref: snapshot.ref,
        id: snapshot.id,
      });
    }
    console.warn(
      `[WARNING] Tried to create match (${snapshot.ref.id}) from ` +
        'non-existent Firestore document.'
    );
    return new Match();
  }

  public static fromSearchHit({ objectID, ...hit }: MatchSearchHit): Match {
    return new Match({ ...hit, ...Resource.fromSearchHit(hit), id: objectID });
  }

  public toSegment(): MatchSegment {
    return { message: this.message, subjects: this.subjects };
  }
}
