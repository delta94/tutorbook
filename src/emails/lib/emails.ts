import Handlebars from 'handlebars';
import Utils from '@tutorbook/covid-utils';

import { MailData } from '@sendgrid/helpers/classes/mail';
import { TemplateDelegate, HelperOptions } from 'handlebars';
import { Appt, AttendeeInterface, User, RoleAlias } from '@tutorbook/model';

import ApptEmailTemplate from './hbs/appt.hbs';

/**
 * Custom handlebars helper that joins a list together using 'and'.
 * @example
 * assert(join(['Chemistry', 'Chemistry H']) === 'Chemistry and Chemistry H');
 * assert(join(['A', 'B', 'C', 'D']) === 'A, B, C and D');
 */
Handlebars.registerHelper('join', function (array: any[]): string {
  return Utils.join(array);
});

/**
 * Custom handlebars helper that returns the first role a user is **not**.
 * @example
 * assert(roles(['tutor'], 3) === 'pupils');
 * assert(roles(['tutor'], 2) === 'pupil');
 * assert(roles(['pupil'], 3) === 'tutors');
 * assert(roles(['pupil'], 2) === 'tutor');
 * assert(roles(['tutor', 'pupil'], 3) === 'people');
 * assert(roles(['tutor', 'pupil'], 2) === 'person');
 */
Handlebars.registerHelper('roles', function (
  roles: RoleAlias[],
  numOfAttendees: number = 2
): RoleAlias | 'tutors' | 'pupils' | 'people' | 'person' {
  if (roles.indexOf('tutor') >= 0 && roles.indexOf('pupil') >= 0) {
    return numOfAttendees > 2 ? 'people' : 'person';
  } else if (roles.indexOf('tutor') >= 0) {
    return numOfAttendees > 2 ? 'pupils' : 'pupil';
  } else if (roles.indexOf('pupil') >= 0) {
    return numOfAttendees > 2 ? 'tutors' : 'tutor';
  } else {
    return numOfAttendees > 2 ? 'people' : 'person';
  }
});

/**
 * Custom handlebars helper that actually provides `if` functionality.
 * @todo Don't use the `any` type for `this`.
 * @see {@link https://stackoverflow.com/a/16315366/10023158}
 */
Handlebars.registerHelper('ifCond', function <T = any>(
  this: any,
  v1: T,
  operator: '==' | '===' | '!=' | '!==' | '<' | '<=' | '>' | '>=' | '&&' | '||',
  v2: T,
  options: HelperOptions
): string {
  switch (operator) {
    case '==':
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case '===':
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case '!=':
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case '!==':
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case '<':
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case '<=':
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case '>':
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case '>=':
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case '&&':
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case '||':
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

export interface Email extends MailData {
  readonly recipient: User;
  readonly html: string;
}

type UserWithRoles = User & { roles: RoleAlias[] };

interface ApptEmailData {
  attendees: UserWithRoles[];
  recipient: UserWithRoles;
  appt: Appt;
}

export class ApptEmail implements Email {
  private static readonly render: TemplateDelegate<
    ApptEmailData
  > = Handlebars.compile(ApptEmailTemplate);
  public readonly from: string = 'Tutorbook <team@tutorbook.org>';
  public readonly to: string;
  public readonly subject: string;
  public readonly html: string;
  public readonly text: string;

  private addRoles(user: User): UserWithRoles {
    const attendee: AttendeeInterface | undefined = this.appt.attendees.find(
      (attendee: AttendeeInterface) => attendee.uid === user.uid
    );
    return Object.assign(Object.assign({}, user), {
      roles: attendee ? attendee.roles : [],
    });
  }

  private get attendeesWithRoles(): UserWithRoles[] {
    return this.attendees.map((attendee: User) => this.addRoles(attendee));
  }

  private get recipientWithRoles(): UserWithRoles {
    return this.addRoles(this.recipient);
  }

  public constructor(
    public readonly recipient: User,
    private readonly appt: Appt,
    private readonly attendees: ReadonlyArray<User>
  ) {
    this.to = `${recipient.name} <${recipient.email}>`;
    //this.subject = `You now have ${Utils.join(appt.subjects)} lessons on Tutorbook!`;
    this.subject = 'This is my third test from the REST API.';
    this.text = this.subject;
    const data: ApptEmailData = {
      recipient: this.recipientWithRoles,
      attendees: this.attendeesWithRoles,
      appt: this.appt,
    };
    this.html = ApptEmail.render(data);
    debugger;
  }
}