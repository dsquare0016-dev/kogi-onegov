/**
 * Staff ID generation utility in the format:
 * KGS/CS/001254/25/55
 */
export function generateStaffId({
  stateCode = 'KGS',
  workforceCode = 'CS',
  serialNumber,
  employmentYear,
  retirementYear
}: {
  stateCode?: string;
  workforceCode?: string;
  serialNumber: number;
  employmentYear: number;
  retirementYear: number;
}): string {
  const serialPadded = String(serialNumber).padStart(6, '0');
  const empYearShort = String(employmentYear).slice(-2);
  const retYearShort = String(retirementYear).slice(-2);
  return `${stateCode}/${workforceCode}/${serialPadded}/${empYearShort}/${retYearShort}`;
}
