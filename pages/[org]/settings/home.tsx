import { useMemo } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import Page from 'components/page';
import Settings from 'components/settings';
import Home from 'components/settings/home';
import { TabHeader } from 'components/navigation';

import { OrgContext } from 'lib/context/org';
import { usePage } from 'lib/hooks';
import { useUser } from 'lib/context/user';
import { withI18n } from 'lib/intl';

import orgIntl from 'locales/en/org.json';
import settings from 'locales/en/settings.json';
import common from 'locales/en/common.json';

function HomeSettingsPage(): JSX.Element {
  const { orgs } = useUser();
  const { query } = useRouter();
  const { t } = useTranslation();

  const org = useMemo(() => {
    const idx = orgs.findIndex((o) => o.id === query.org);
    if (idx < 0) return;
    return orgs[idx];
  }, [orgs, query.org]);

  usePage({
    name: 'Org Home Settings',
    url: `/${query.org as string}/settings/home`,
    org: query.org as string,
    login: true,
    admin: true,
  });

  return (
    <OrgContext.Provider value={{ org }}>
      <Page title={`${org?.name || 'Loading'} - Home - Settings - Tutorbook`}>
        <TabHeader
          switcher
          tabs={[
            {
              label: t('common:overview'),
              href: `/${query.org as string}/dashboard`,
            },
            {
              label: t('common:users'),
              href: `/${query.org as string}/users`,
            },
            {
              label: t('common:matches'),
              href: `/${query.org as string}/matches`,
            },
            {
              label: t('common:settings'),
              active: true,
              href: `/${query.org as string}/settings`,
            },
          ]}
        />
        <Settings active='home' orgId={query.org as string}>
          <Home />
        </Settings>
      </Page>
    </OrgContext.Provider>
  );
}

export default withI18n(HomeSettingsPage, { common, settings, org: orgIntl });
