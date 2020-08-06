import { useRouter } from 'next/router';
import { useUser } from 'lib/account';
import { MenuSurfaceAnchor, MenuSurface } from '@rmwc/menu';
import { Org, OrgJSON } from 'lib/model';
import { IntercomAPI } from 'components/react-intercom';

import React, { useState, useEffect, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { PopOverButton, PopOverAccountLink } from './pop-over';

import styles from './pop-over.module.scss';

export default function Switcher(): JSX.Element {
  const { t } = useTranslation();
  const { pathname, query } = useRouter();
  const { user, orgs } = useUser();

  const [open, setOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>('Account');

  useEffect(() => {
    if (!orgs) return setSelected('Account');
    const idx: number = orgs.findIndex((o: OrgJSON) => o.id === query.org);
    if (idx < 0) return setSelected('Account');
    return setSelected(orgs[idx].name);
  }, [orgs, query]);

  const destination = useMemo(() => {
    if (pathname.indexOf('people') >= 0) return 'people';
    if (pathname.indexOf('appts') >= 0) return 'appts';
    return 'dashboard';
  }, [pathname]);

  return (
    <MenuSurfaceAnchor>
      <MenuSurface
        className={styles.menu}
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className={styles.picker}>
          <div className={styles.header}>{t('common:personal-account')}</div>
          <PopOverAccountLink account={user} href='/dashboard' />
          {orgs && !!orgs.length && (
            <>
              <div className={styles.line} />
              <div className={styles.header}>{t('common:organizations')}</div>
              {orgs.map((org: OrgJSON) => (
                <PopOverAccountLink
                  key={org.id}
                  account={Org.fromJSON(org)}
                  href={`/[org]/${destination}`}
                  as={`/${org.id}/${destination}`}
                />
              ))}
            </>
          )}
          <div className={styles.line} />
          <PopOverButton
            icon='add'
            onClick={() =>
              IntercomAPI('showNewMessage', t('common:new-org-msg'))
            }
          >
            {t('common:new-org-btn')}
          </PopOverButton>
        </div>
      </MenuSurface>

      <div className={styles.selector}>
        <button
          type='button'
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup
          className={styles.button}
        >
          <div className={styles.wrapper}>
            <div className={styles.selected}>
              <span className={styles.selectedText}>{selected}</span>
            </div>
            <div className={styles.arrowWrapper}>
              <div className={styles.arrow} />
            </div>
          </div>
        </button>
      </div>
    </MenuSurfaceAnchor>
  );
}