import cn from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import { useUser } from 'lib/context/user';

import Group from './group';
import Link from './link';
import styles from './footer.module.scss';

export interface FooterProps {
  formWidth?: boolean;
}

export default function Footer({ formWidth }: FooterProps): JSX.Element {
  const { t } = useTranslation();
  const { user } = useUser();

  return (
    <footer className={cn(styles.footer, { [styles.formWidth]: formWidth })}>
      <nav role='navigation'>
        <Group label={t('common:footer-useful-links')}>
          <Link href={`/${user.orgs[0] || 'default'}/signup`}>
            {t('common:footer-signup')}
          </Link>
          <Link href={`/${user.orgs[0] || 'default'}/search`}>
            {t('common:footer-search')}
          </Link>
          <Link href='https://github.com/tutorbookapp/tutorbook/issues/new/choose'>
            {t('common:footer-issue')}
          </Link>
        </Group>
        <Group label={t('common:footer-resources')}>
          <Link href='https://intercom.help/tutorbook'>
            {t('common:footer-help-center')}
          </Link>
          <Link href='https://intercom.help/tutorbook/articles/4048870-how-it-works'>
            {t('common:footer-how-it-works')}
          </Link>
          <Link href='https://github.com/orgs/tutorbookapp'>
            {t('common:footer-open-source')}
          </Link>
          <Link href='https://github.com/tutorbookapp/tutorbook#readme'>
            {t('common:footer-docs')}
          </Link>
        </Group>
        <Group label={t('common:footer-socials')}>
          <Link href='https://facebook.com/tutorbookapp'>
            {t('common:facebook')}
          </Link>
          <Link href='https://instagram.com/tutorbookapp'>
            {t('common:instagram')}
          </Link>
          <Link href='https://twitter.com/tutorbookapp'>
            {t('common:twitter')}
          </Link>
          <Link href='https://github.com/orgs/tutorbookapp'>
            {t('common:github')}
          </Link>
          <Link href='https://helpwithcovid.com/projects/782-tutorbook'>
            {t('common:helpwithcovid')}
          </Link>
          <Link href='https://www.indiehackers.com/product/tutorbook'>
            {t('common:indiehackers')}
          </Link>
        </Group>
        <Group label={t('common:footer-team')}>
          <Link href='https://tutorbook.atlassian.net/wiki/spaces/TB/overview'>
            {t('common:footer-team-home')}
          </Link>
          <Link href='https://tutorbook.atlassian.net/people'>
            {t('common:footer-team-directory')}
          </Link>
          <Link href='https://join.slack.com/t/tutorbookapp/shared_invite/zt-ekmpvd9t-uzH_HuS6KbwVg480TAMa5g'>
            {t('common:footer-team-slack')}
          </Link>
          <Link href='https://helpwithcovid.com/projects/782-tutorbook'>
            {t('common:footer-team-join')}
          </Link>
          <Link href='mailto:team@tutorbook.org'>
            {t('common:footer-contact')}
          </Link>
        </Group>
      </nav>
      <section>
        <span>Copyright &copy; 2020 Tutorbook. All rights reserved.</span>
      </section>
    </footer>
  );
}
