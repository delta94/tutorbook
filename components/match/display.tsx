import Link from 'next/link';
import TimeAgo from 'timeago-react';
import Trans from 'next-translate/Trans';
import cn from 'classnames';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';

import Avatar from 'components/avatar';
import LoadingDots from 'components/loading-dots';
import MatchLog from 'components/match/log';

import { Match, Meeting, User } from 'lib/model';
import { join, period } from 'lib/utils';
import { useOrg } from 'lib/context/org';

import styles from './display.module.scss';

interface EventProps {
  badge: string;
  time?: Date;
  person?: User;
  children: React.ReactNode;
}

function Event({ badge, time, person, children }: EventProps): JSX.Element {
  const { org } = useOrg();
  const { lang: locale } = useTranslation();

  return (
    <div className={styles.event}>
      <div className={styles.badge}>
        <span className='material-icons'>{badge}</span>
      </div>
      <div className={styles.content}>
        {time && (
          <TimeAgo datetime={time} className={styles.time} locale={locale} />
        )}
        {!time && <div className={styles.time} />}
        <div className={styles.body}>
          {person && (
            <>
              <Link href={`/${org?.id || 'default'}/users/${person.id}`}>
                <a>{person.name}</a>
              </Link>{' '}
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Endpoint(): JSX.Element {
  return (
    <div className={styles.origin}>
      <div className={styles.badge} />
    </div>
  );
}

export interface MatchDisplayProps {
  match?: Match;
  people?: User[];
  meetings?: Meeting[];
}

export default function MatchDisplay({
  match,
  people,
  meetings,
}: MatchDisplayProps): JSX.Element {
  const { org } = useOrg();
  const { t } = useTranslation();

  const loading = useMemo(() => {
    return !match || !people || !meetings;
  }, [match, people, meetings]);
  const creator = useMemo(() => {
    if (loading || !match || !people) return;
    const idx = people.findIndex((p) => p.id === match.creator.id);
    return idx < 0 ? new User(match.creator) : people[idx];
  }, [loading, people, match]);

  return (
    <>
      <div className={cn(styles.header, { [styles.loading]: loading })}>
        <div className={styles.wrapper}>
          <div className={styles.people}>
            {!loading &&
              (people || []).map((person) => (
                <Link
                  href={`/${org?.id || 'default'}/users/${person.id}`}
                  key={person.id}
                >
                  <a className={styles.person}>
                    <div className={styles.avatar}>
                      <Avatar src={person.photo} size={200} />
                    </div>
                    <h1 className={styles.name}>{person.name}</h1>
                    <div className={styles.roles}>
                      {join(person.roles.map((r) => t(`common:${r}`))) ||
                        'unknown'}
                    </div>
                  </a>
                </Link>
              ))}
            {loading &&
              Array(2)
                .fill(null)
                .map(() => (
                  <div key={nanoid()} className={styles.person}>
                    <div className={styles.avatar}>
                      <Avatar size={200} loading />
                    </div>
                    <h2 className={styles.name} />
                  </div>
                ))}
          </div>
          <div className={styles.info}>
            <dl>
              <dt>Subjects</dt>
              <dd>
                {loading && <LoadingDots />}
                {!loading && join(match?.subjects || [])}
              </dd>
            </dl>
            <dl>
              <dt>Next meeting time</dt>
              <dd>
                {loading && <LoadingDots />}
                {!loading &&
                  (match?.time?.toString() || 'No scheduled meetings')}
              </dd>
            </dl>
            <dl>
              <dt>Meeting venue</dt>
              <dd>
                {loading && <LoadingDots />}
                {!loading && <a href={match?.venue.url}>{match?.venue.url}</a>}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className={cn(styles.timeline, { [styles.loading]: loading })}>
        <div className={styles.wrapper}>
          <Event
            badge='add_box'
            time={!loading ? new Date(match?.venue.created || '') : undefined}
            person={creator}
          >
            {t('matches:event-created')}
          </Event>
          <Event
            badge='email'
            time={!loading ? new Date(match?.venue.created || '') : undefined}
            person={creator}
          >
            <Trans
              i18nKey='matches:event-message'
              components={[<br />]}
              values={{ message: period(match?.message || '') }}
            />
          </Event>
          {!loading &&
            (meetings || []).map((meeting) => (
              <Event
                key={meeting.id}
                badge='event_note'
                time={new Date(meeting.created)}
                person={(() => {
                  if (!people) return;
                  const findCreator = (p: User) => p.id === meeting.creator.id;
                  return people[people.findIndex(findCreator)];
                })()}
              >
                <Trans
                  i18nKey='matches:event-meeting'
                  components={[<br />]}
                  values={{ time: meeting.time.toString() }}
                />
              </Event>
            ))}
          {!loading && <MatchLog match={match} />}
          {loading && <Endpoint />}
        </div>
      </div>
    </>
  );
}
