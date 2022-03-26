# Callibella 🐒

> It is considered unusual among Callibella in that it gives birth to only a single baby instead of twins, the norm for Callibella. [Wikiepdia](https://en.wikipedia.org/wiki/Callibella)

Callibella was created under the assumption that it's normal for humas to have two calendars - one personal calendar that goes with them for years, and one work calendar. Your work calendar might be shared with others in the company, making it easy for others to book meetings with you by simply checking when you're free. However, this goes wrong when important personal events are missing from your work calendar.

Callibella reads your personal calendar and then connects to your work calendar and generates matching events. It doesn't reveal the content of your events - every event coming from your personal calendar will show up as "Busy" only, without description or location. Callibella will keep this event in sync with the original personal event, updating it's time or deleting it if nescasery.

## Configuration

Callibella makes heavy use of [tsdav](https://github.com/natelindev/tsdav/) to configure your source and destination calendars. Check tsdav's documentation for complete details. Below is an example of my `~/.config/callibella/config.json`:

```json
{
  "timeRange": {
    "daysInPast": 7,
    "daysInFuture": 180
  },
  "source": {
    "connection": {
      "serverUrl": "https://calendar.zoho.com/",

      "credentials": {
        "username": "my@example.com",
        "password": "correcthorsebatterystaple"
      },
      "authMethod": "Basic",
      "defaultAccountType": "caldav"
    },
    "calendar": "my-calendar-display-name"
  },
  "destination": {
    "connection": {
      "serverUrl": "https://oauth-hopper.example.com/caldav/v2/me@company.com/user/",

      "credentials": {
        "username": "me",
        "password": "Tr0ub4dor&3"
      },
      "authMethod": "Basic",
      "defaultAccountType": "caldav"
    },
    "calendar": "me@company.com"
  }
}
```

- `timeRange` will define the range of dates in which Callibella would sync things.
- `source.connection` is the same object you would pass to tsdav's `DAVClient`, and will include information about your source CalDAV server.
- `source.calendar` is the unique name identifier of your calendar on this CalDAV server.
- `destination.*` is exactly the same as `source.*`, and will include the details of your work calendar. In the above example I'm using [OAuth Hopper](https://github.com/bjesus/oauth-hopper/) to skip OAuth authenticaion with Google, but it's not a must as it seems like tsdav supports OAuth authenticaion too.

## Usage

1. Configure your calendars as explained above and save the file at `~/.config/callibella/config.json`
2. Run `npx callibella` to start syncing without installation, or install it using `npm install -g callibella` and then use `callibella`
3. Everything works? Add a cron job for it and have your calendars forever synced!
