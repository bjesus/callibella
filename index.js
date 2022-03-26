#!/usr/bin/env node
import { maskEvent } from './utils.js'
import { DAVClient } from 'tsdav'
import ical from 'node-ical'
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'

console.log('Callibella 🐒 Your calendar syncing monkey!\n')

const configFile = homedir() + '/.config/callibella/config.json'
if (!existsSync(configFile)) {
  console.error('Configuration file not found at:', configFile)
  console.error('Please create one before running Callibella')
  process.exit(1)
}

const rawConfig = readFileSync(configFile)
const config = JSON.parse(rawConfig.toString())

const summary = { added: 0, deleted: 0, updated: 0 }
const start = new Date()
const end = new Date()
const timeRange = {
  start:
    start.setDate(start.getDate() - config.timeRange.daysInPast) &&
    start.toISOString(),
  end:
    end.setDate(end.getDate() + config.timeRange.daysInFuture) &&
    end.toISOString(),
}

;(async () => {
  const sourceClient = new DAVClient(config.source.connection)
  const destinationClient = new DAVClient(config.destination.connection)
  console.log(':: Connecting to calendars...')
  await Promise.all([sourceClient.login(), destinationClient.login()])

  console.log(':: Getting events...')
  const sourceCalendar = (await sourceClient.fetchCalendars()).filter(
    (cal) => cal.displayName === config.source.calendar,
  )[0]

  let sourceEvents = await sourceClient.fetchCalendarObjects({
    calendar: sourceCalendar,
    timeRange,
  })

  const destinationCalendar = (await destinationClient.fetchCalendars()).filter(
    (cal) => cal.displayName === config.destination.calendar,
  )[0]

  const destinationEvents = (
    await destinationClient.fetchCalendarObjects({
      calendar: destinationCalendar,
      timeRange,
      // TODO: use filters to get event "Created by Callibella"
    })
  ).filter((event) => event.data?.includes('Created by Callibella'))

  console.log(':: Comparing events to sync...')
  for (const event of destinationEvents) {
    const parsedEvent = Object.entries(ical.sync.parseICS(event.data)).filter(
      (x) => x[1].type === 'VEVENT',
    )[0][1]

    const uid = event.data.split('\n').filter((e) => e.startsWith('UID'))[0]

    // Find matching sourceEvent using the UID
    const sourceMatch = sourceEvents.filter((event) => event.data.includes(uid))

    // Delete from destination if it doesn't exist
    if (!sourceMatch.length) {
      process.stdout.write(':: Deleting destination event without a match... ')
      const res = await destinationClient.deleteCalendarObject({
        calendarObject: {
          url: event.url,
          etag: event.etag,
        },
      })
      console.log(res.status)
      summary.deleted++
      continue
    }

    const parsedSourceMatch = Object.entries(
      ical.sync.parseICS(sourceMatch[0].data),
    ).filter((x) => x[1].type === 'VEVENT')[0][1]

    // if time is differnt
    if (
      parsedSourceMatch?.start &&
      parsedEvent?.start &&
      parsedSourceMatch?.end &&
      parsedEvent?.end &&
      (parsedSourceMatch.start.toString() !== parsedEvent.start.toString() ||
        parsedSourceMatch.end.toString() !== parsedEvent.end.toString())
    ) {
      // adjust time
      process.stdout.write(
        `:: Updating destination event based on "${parsedSourceMatch.summary}"... `,
      )
      const res = await destinationClient.updateCalendarObject({
        calendarObject: {
          data: maskEvent(sourceMatch[0].data),
          url: event.url,
          etag: event.etag,
        },
      })
      console.log(res.status)
      summary.updated++
    }
    // Remove from sourceEvents after processing
    sourceEvents = sourceEvents.filter((event) => !event.data.includes(uid))
  }
  //
  for (const event of sourceEvents.filter((event) => event.data)) {
    const parsedSourceMatch = Object.entries(
      ical.sync.parseICS(event.data),
    ).filter((x) => x[1].type === 'VEVENT')[0][1]

    process.stdout.write(
      `:: Creating new destination event based on "${parsedSourceMatch.summary}"... `,
    )
    const res = await destinationClient.createCalendarObject({
      calendar: destinationCalendar,
      filename: 'not used',
      iCalString: maskEvent(event.data),
    })
    console.log(res.status)
    summary.added++
  }
  console.log(`\nNew events: ${summary.added}`)
  console.log(`Updated events: ${summary.updated}`)
  console.log(`Deleted events: ${summary.deleted}`)
  console.log('\nDone working, going to have a banana 🍌')
})()
