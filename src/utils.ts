export const maskEvent = (data: string): string => {
  return data
    .replace(/SUMMARY.*/, 'SUMMARY:Busy\n')
    .replace(/DESCRIPTION.*/, 'DESCRIPTION:Created by Callibella 🐒\n')
    .replace(/LOCATION.*/, 'LOCATION:\n')
}
