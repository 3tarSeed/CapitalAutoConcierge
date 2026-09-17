/**
 * Service area by ZIP prefix (first three digits). Edit this list to widen or narrow coverage.
 *   200–205  Washington, DC
 *   207      Prince George's County, MD (Bowie, Laurel, Bethesda-adjacent)
 *   208–209  Montgomery County, MD (Bethesda, Potomac, Rockville, Silver Spring, Gaithersburg)
 *   201      Loudoun / western Prince William, VA (Ashburn, Leesburg, Sterling, Chantilly)
 *   220–221  Fairfax County, VA (McLean, Vienna, Reston, Fairfax, Falls Church, Springfield)
 *   222      Arlington, VA
 *   223      Alexandria, VA
 * Not included: 206 (Southern MD), 210–212 (Baltimore/Annapolis), 224+ (Fredericksburg and beyond).
 */
export const serviceAreaPrefixes = ["200","201","202","203","204","205","207","208","209","220","221","222","223"] as const;

export const serviceAreaLabel = "Suburban DC, Maryland & Virginia";

export function inServiceArea(zip: string): boolean {
  return /^\d{5}$/.test(zip) && (serviceAreaPrefixes as readonly string[]).includes(zip.slice(0, 3));
}
