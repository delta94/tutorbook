import { v4 as uuid } from 'uuid';
import useSWR from 'swr';
import to from 'await-to-js';
import axios, { AxiosResponse, AxiosError } from 'axios';

import React from 'react';
import Result from '@tutorbook/search/result';
import { useAccount } from '@tutorbook/firebase';
import { ApiError, User, UserJSON } from '@tutorbook/model';
import Title from './title';

import styles from './people.module.scss';

async function fetchPeopleData(
  url: string,
  id: string,
  token: string
): Promise<User[]> {
  console.log('[DEBUG] Fetching people data...', [url, id, token]);
  const [err, res] = await to<AxiosResponse<UserJSON[]>, AxiosError<ApiError>>(
    axios.get(url, { params: { id, token } })
  );
  if (err && err.response) {
    console.error(`[ERROR] ${err.response.data.msg}`);
    throw new Error(err.response.data.msg);
  } else if (err && err.request) {
    console.error('[ERROR] Search REST API did not respond:', err.request);
    throw new Error('Search REST API did not respond.');
  } else if (err) {
    console.error('[ERROR] While sending request:', err);
    throw new Error(`While sending request: ${err.message}`);
  } else {
    return (res as AxiosResponse<UserJSON[]>).data.map((user: UserJSON) =>
      User.fromJSON(user)
    );
  }
}

export default function People(): JSX.Element {
  const {
    account: { id },
    token,
  } = useAccount();
  console.log(`[DEBUG] Rerendered with account (${id}) and token:`, token);
  const { data } = useSWR(
    () => (id && token ? ['/api/people', id, token] : null),
    fetchPeopleData
  );
  return (
    <>
      <Title
        header='People'
        body='Pending sign-ups that have yet to be vetted.'
      />
      <ul className={styles.results}>
        {!data &&
          Array(5)
            .fill(null)
            .map(() => <Result loading key={uuid()} />)}
        {data &&
          data.map((person: User) => (
            <Result user={person} key={person.id || uuid()} />
          ))}
      </ul>
    </>
  );
}