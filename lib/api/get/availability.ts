import { Availability } from 'lib/model';
import { getMonthsTimeslots } from 'lib/utils/time';
import getUser from 'lib/api/get/user';
import getUserMatches from 'lib/api/get/user-matches';

/**
 * Calculates the user's availability for a given month and returns an array of
 * 30 min timeslots in 15 min increments. This considers the following:
 * 1. User defined "working hours" (i.e. the weekly recurring `availability`
 *    specified in his/her profile document).
 * 2. Matches and their weekly recurring `time`.
 * @param uid - The ID of the user whose availability we want to fetch.
 * @param month - The month to get timeslots for.
 * @param year - The year to get timeslots for.
 * @return An array of 30 min timeslots in 15 increments on the given month.
 */
export default async function getAvailability(
  uid: string,
  month: number,
  year: number
): Promise<Availability> {
  // 1. Start with a baseline weekly recurring availability.
  const { availability: baseline } = await getUser(uid);

  // 2. Remove the weekly recurring match times from that availability.
  const matches = await getUserMatches(uid);
  matches.forEach((m) => (m.time ? baseline.remove(m.time) : undefined));

  // 3. Split each of the availability timeslots into 30 min timeslots in 15 min
  // intervals. This assumes there is no overlap between the baseline timeslots.
  return getMonthsTimeslots(baseline, month, year);
}
