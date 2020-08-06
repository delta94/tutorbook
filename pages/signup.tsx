import Intercom from 'components/react-intercom';
import Footer from 'components/footer';
import Signup from 'components/signup';

import React, { useState } from 'react';

import { withI18n } from 'lib/intl';
import { Aspect } from 'lib/model';
import { AspectHeader } from 'components/navigation';

import common from 'locales/en/common.json';
import signup from 'locales/en/signup.json';
import user3rd from 'locales/en/user3rd.json';

function SignupPage(): JSX.Element {
  const [aspect, setAspect] = useState<Aspect>('mentoring');
  return (
    <>
      <AspectHeader
        aspect={aspect}
        onChange={(newAspect: Aspect) => setAspect(newAspect)}
        formWidth
      />
      <Signup aspect={aspect} />
      <Footer formWidth />
      <Intercom />
    </>
  );
}

export default withI18n(SignupPage, { common, signup, user3rd });
