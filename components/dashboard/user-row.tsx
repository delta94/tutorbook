import { DataTableRow, DataTableCell } from '@rmwc/data-table';
import { TextField } from '@rmwc/textfield';
import { Checkbox } from '@rmwc/checkbox';
import { Callback, User, UserJSON } from 'lib/model';

import React from 'react';
import Utils from 'lib/utils';

import equal from 'fast-deep-equal';
import styles from './people.module.scss';

interface RowProps {
  user: User;
  onClick: () => void;
  onChange: (event: React.FormEvent<HTMLInputElement>, field: string) => void;
}

const Row = function Row({ user, onClick, onChange }: RowProps): JSX.Element {
  return (
    <DataTableRow>
      <DataTableCell hasFormControl className={styles.visible}>
        <Checkbox
          checked={user.visible}
          onChange={(evt) => onChange(evt, 'visible')}
        />
      </DataTableCell>
      <DataTableCell hasFormControl className={styles.vetted}>
        <Checkbox checked={!!user.verifications.length} onClick={onClick} />
      </DataTableCell>
      <DataTableCell className={styles.name}>
        <TextField
          value={user.name}
          onChange={(evt) => onChange(evt, 'name')}
        />
      </DataTableCell>
      <DataTableCell className={styles.bio}>
        <TextField value={user.bio} onChange={(evt) => onChange(evt, 'bio')} />
      </DataTableCell>
      <DataTableCell className={styles.email}>
        <TextField
          value={user.email}
          onChange={(evt) => onChange(evt, 'email')}
          type='email'
        />
      </DataTableCell>
      <DataTableCell className={styles.phone}>
        <TextField
          value={user.phone ? user.phone : undefined}
          onChange={(evt) => onChange(evt, 'phone')}
          type='tel'
        />
      </DataTableCell>
      <DataTableCell className={styles.subjects}>
        {Utils.join(user.tutoring.subjects)}
      </DataTableCell>
      <DataTableCell className={styles.subjects}>
        {Utils.join(user.mentoring.subjects)}
      </DataTableCell>
    </DataTableRow>
  );
};

export const LoadingRow = React.memo(function LoadingRow(): JSX.Element {
  const [user, setUser] = React.useState<User>(new User());

  return (
    <Row
      user={user}
      onClick={() => {}}
      onChange={(event: React.FormEvent<HTMLInputElement>, field: string) => {
        setUser(new User({ ...user, [field]: event.currentTarget.value }));
      }}
    />
  );
});

interface UserRowProps {
  user: UserJSON;
  onClick: () => void;
  onChange: Callback<UserJSON>;
}

/**
 * The `PeopleRow` accepts an initial state of a user object (fetched via the
 * `api/people` endpoint using the current filters within the data table). It
 * then maintains it's own internal state of the user, calls the `api/user`
 * endpoint whenever a `TextField` is unfocused, and alerts the parent component
 * to update it's data (i.e. perform a locale mutation and re-fetch) once the
 * change is enacted.
 */
export default React.memo(
  function UserRow({ user, onClick, onChange }: UserRowProps): JSX.Element {
    return (
      <Row
        onClick={onClick}
        user={user ? User.fromJSON(user) : user}
        onChange={(event: React.FormEvent<HTMLInputElement>, field: string) => {
          const value: string | boolean =
            field === 'visible'
              ? !!event.currentTarget.checked
              : event.currentTarget.value;
          return onChange({ ...user, [field]: value });
        }}
      />
    );
  },
  (prevProps: UserRowProps, nextProps: UserRowProps) => {
    return equal(prevProps.user, nextProps.user);
  }
);
