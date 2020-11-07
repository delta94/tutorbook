import cn from 'classnames';
import { useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';

import Avatar from 'components/avatar';
import Button from 'components/button';

import { OrgJSON, SocialInterface } from 'lib/model';
import Link from 'lib/intl/link';
import { join } from 'lib/utils';

import styles from './home.module.scss';

export interface HomeProps {
  org?: OrgJSON;
}

export default function Home({ org }: HomeProps): JSX.Element {
  const { t, lang: locale } = useTranslation();
  const autogeneratedAboutString = useMemo(() => {
    const as = org ? org.aspects : ['tutoring', 'mentoring'];
    let person = '';
    let people = '';
    if (as.includes('tutoring')) {
      person += 'tutor';
      people += 'tutors';
    }
    if (as.includes('mentoring')) {
      person += ' or mentor';
      people += ' and mentors';
    }
    const name = org ? org.name : 'This organization';
    return t('home:about', { name, person, people, aspects: join(as) });
  }, [org, t]);

  // TODO: Replace the <img /> tag with the Next.js <Image />, ensure that the
  // banner images are always the same ratio (using a back-end API), and then
  // restyle this to allow for automatic image optimization.
  // @see {@link https://github.com/tutorbookapp/tutorbook/issues/139}
  // @see {@link https://github.com/vercel/next.js/issues/18871}

  return (
    <div data-cy='org-home' className={cn({ [styles.loading]: !org })}>
      {(!org || org.home[locale].photo) && (
        <div className={styles.background}>
          <img
            data-cy='backdrop'
            src={org?.home[locale].photo || ''}
            alt={`Background of ${org ? org.name : 'Organization'}`}
          />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.wrapper}>
            <a
              className={styles.img}
              href={org && org.photo}
              target='_blank'
              rel='noreferrer'
              tabIndex={-1}
            >
              <Avatar size={120} loading={!org} src={org && org.photo} />
            </a>
            <div>
              <h1 data-cy='name' className={styles.name}>
                {org && org.name}
              </h1>
              {(!org || !!org.socials.length) && (
                <div data-cy='socials' className={styles.socials}>
                  {(org ? org.socials : []).map((social: SocialInterface) => (
                    <a
                      data-cy={`${social.type}-social-link`}
                      key={social.type}
                      target='_blank'
                      rel='noreferrer'
                      href={social.url}
                      className={`${styles.socialLink} ${styles[social.type]}`}
                    >
                      {social.type}
                    </a>
                  ))}
                  {!!org?.email && (
                    <a
                      data-cy='email-social-link'
                      target='_blank'
                      rel='noreferrer'
                      href={`mailto:${encodeURIComponent(
                        `"${org.name}"<${org.email}>`
                      )}`}
                      className={`${styles.socialLink} ${styles.email}`}
                    >
                      {org.email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <h2 className={styles.header}>{org && t('common:about')}</h2>
          <p data-cy='bio' className={styles.body}>
            {org && org.bio}
          </p>
          <p className={styles.body}>{org && autogeneratedAboutString}</p>
          <h2 data-cy='header' className={styles.header}>
            {org && org.home[locale].header}
          </h2>
          <p data-cy='body' className={styles.body}>
            {org && org.home[locale].body}
          </p>
        </div>
        <div className={styles.right}>
          <div className={styles.actions}>
            {(org ? org.aspects : ['tutoring', 'mentoring']).map((aspect) => (
              <div key={aspect} className={styles.card}>
                <Link href={`/${org?.id || 'default'}/search?aspect=${aspect}`}>
                  <a>
                    <Button
                      className={styles.btn}
                      label={t(`home:search-${aspect}`)}
                      raised
                      arrow
                    />
                  </a>
                </Link>
                <Link href={`/${org?.id || 'default'}/signup?aspect=${aspect}`}>
                  <a>
                    <Button
                      className={styles.btn}
                      label={t(`home:signup-${aspect}`)}
                      outlined
                      arrow
                    />
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
