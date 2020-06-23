import React from 'react';

import { GetStaticProps, GetStaticPaths } from 'next';
import {
  useIntl,
  getIntlProps,
  getIntlPaths,
  withIntl,
  IntlShape,
  IntlHelper,
  Msg,
} from '@tutorbook/intl';
import { People } from '@tutorbook/dashboard';
import { TabHeader } from '@tutorbook/header';

import Intercom from '@tutorbook/react-intercom';
import Footer from '@tutorbook/footer';

import msgs from '@tutorbook/dashboard/msgs';

function PeopleDashboardPage(): JSX.Element {
  const intl: IntlShape = useIntl();
  const msg: IntlHelper = (message: Msg) => intl.formatMessage(message);
  return (
    <>
      <TabHeader
        tabs={[
          {
            label: msg(msgs.overview),
            active: false,
            href: '/dashboard',
          },
          {
            label: msg(msgs.people),
            active: true,
            href: '/dashboard/people',
          },
        ]}
      />
      <People />
      <Footer />
      <Intercom />
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => ({
  props: await getIntlProps(context),
});

/* eslint-disable-next-line @typescript-eslint/require-await */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getIntlPaths(),
  fallback: false,
});

export default withIntl(PeopleDashboardPage);