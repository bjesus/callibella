export const maskEvent = (data) => {
  return data
    .replace(/SUMMARY.*/, 'SUMMARY:Busy\n')
    .replace(/DESCRIPTION.*/, 'DESCRIPTION:Created by Callibella 🐒\n')
    .replace(/LOCATION.*/, 'LOCATION:\n')
    .replace(/^ATTENDEE.*\n?/gm, '')
}
