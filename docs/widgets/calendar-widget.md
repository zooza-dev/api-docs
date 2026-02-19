---
title: Calendar widget
description: The Zooza calendar widget — real-time schedule view with filtering, custom session import, and click-through options.
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Calendar widget

**This widget shows a real time calendar of activities based on your settings.**

## Installation

### WordPress

When your WordPress plugin is installed, just head to `Settings > Zooza` and from dropdown of pages, select a page where you want the form to appear.

#### Shortcodes

You can also use shortcodes to place the form anywhere within the page. More configuration options for shortcodes is described below in their respective sections.

```plaintext
[zooza type="calendar"]
```

### Wix

In Wix editor, click on Zooza widget. In the `Settings` panel, enter the api key and as a widget choose `Calendar`.

### Embed code

Place the following snippet directly into the `<body>` of your page, where you want the booking form to appear.

| Placeholder | Description | Example Value |
|---|---|---|
| `YOUR_API_KEY` | Replace with the API key found in the application under `Publish > Widget`. Appears twice. | `abc123xyz` |
| `ZOOZA_API_URL` | Replace with the Zooza API URL for your region: Europe: `https://api.zooza.app`, UK: `https://uk.api.zooza.app`, UAE: `https://asia.api.zooza.app` | `https://api.zooza.app` |

```javascript
<script data-version='v2' data-widget-id='zooza' id='YOUR_API_KEY' type='text/javascript'>
( function() {
function async_load(){
    document.body.setAttribute('data-zooza-api-url', 'ZOOZA_API_URL');
    var s = document.createElement('script'); s.type = 'text/javascript'; s.async = true;
    s.src = document.body.getAttribute('data-zooza-api-url') +
     '/widgets/v2/?type=calendar&ref=' + encodeURIComponent( window.location.href );
    var embedder = document.getElementById( 'YOUR_API_KEY' );
    embedder.parentNode.insertBefore( s, embedder );
}
if ( window.attachEvent ) {
    window.attachEvent( 'onload', async_load );
} else {
    window.addEventListener( 'load', async_load, false );
}
} )();
</script>
```

## Settings

These settings are managed within the Zooza's main application `Publish > Widget > Calendar`.

### URL

This will let Zooza know where your widget resides so that it can [redirect your customers](index.md#importance-of-a-url) to it when necessary.

### Availability

This will affect how the availability information is shown for classes.

| Value | Description | Example Value |
|---|---|---|
| Do not show | Availability information will be hidden | _n/a_ |
| Current status | This will show exact real-time numbered value, thus revealing how many users are already booked out of available capacity | _10/10_ |
| Text information (Default) | This will show text version of the above | _Last spot available_ |

### Use link for more information

If enabled, then clicking on calendar tile will navigate users to a course url provided in `Courses > Course > Settings > Course Settings > URL`.

### Use link to registration

If enabled, then clicking on calendar tile will navigate users to a [Registration Form](./registration-widget.md).

### Main click-through

If both options above are enabled, then a button appears on the tile. Now you can choose what happens when users click on that button.

| Value | Description |
|---|---|
| Registration | Clicking on a button will take users to registration form. Clicking on tile will take them to more information. |
| More Information | Clicking on a button will take users to more information. Clicking on tile will take them to registration form. |

### Customize sessions shown in calendar

| Value | Description |
|---|---|
| System (default) | Shows all currently running classes as well as upcoming classes in abstract week view. This means that the view doesn't show specific date. Instead it shows a monday through saturday view and merges all classes into this view based on day when they happen. |
| Custom selection | Customize which sessions are shown and how. More details in table below. |

#### Custom selection

| Value | Description |
|---|---|
| Session dates in current classes | This will show sessions for classes that are already running |
| Dates for future classes | This will show sessions for classes that did not start yet |
| Cancelled sessions | Cancelled sessions will be shown without any click through |
| Sessions unavailable for registration | If the `Hide` option is set for a course, the sessions will not be displayed in the calendar when such a class is full. If you still want to display them, select this option. |
| Classic calendar view | Sessions will be shown in normal calendar view, instead of an abstract week view |

### Merge classrooms into single location

This will merge all classrooms that are listed under locations under their respective location. So instead of filter showing options like: Room 1, Room 2, it will only list the main location with all classrooms included.

### Show instructor

Turn on to show instructor's name in the calendar.

### Show session number

Turn on to show session's index number.

### Show session duration

Turn on to show session's duration.

### Show course description

Turn on to show course's description.

### Show course filtering

This is a general toggle that will either disable or enable class filter on top of the calendar view.

#### Filter by location

Enables filtering by location.

#### Filter by course

Enables filtering by course name.

#### Filter by course type

Enables filtering by course type.

#### Filter by instructor

Enable filtering by instructor.

#### Show filter button

If filter button is shown, then filter is hidden by default. Users will need to click the Filter button to open a filter. If turned off, filter (if enabled) appears automatically above the calendar.

### Hide information about current class

When users will be navigated to a registration form, this form typically shows a summary of current class (Course name, location, dates etc.). Enable this to hide this information and go straight to a personal information part of the form.

### Use CSS

This will load default Zooza styling. By default this is turned on. Typically you only want to override couple of styles but if you want, you can turn this off and create your own styling from scratch. However we recommend downloading the default styling and go from there, instead of building everything from scratch.

You can download the default css from this URL:

`API_URL/widgets/v2/css/?widget=calendar`

## Initialisation options

Due to legacy reasons, some of the parameters are defined into `document.zooza` and some into `window.ZOOZA`. It is always shown along each property which way to use. However the concept stays the same: insert the script tag before the embed code.

### `filter_courses`

_Type: Array, String_

This will allow you to limit which courses are shown in the booking form.

| Value | Description | Example Value |
|---|---|---|
| `YOUR_COURSE_ID` | Array of course ids. | `[ 123, 1234 ]` For WordPress see note in its tab. |

<Tabs>
  <TabItem value="js" label="JavaScript">

```javascript
<script>
    window.ZOOZA = {
        course_ids: [ YOUR_COURSE_ID ]
    }
</script>
```

  </TabItem>
  <TabItem value="wp" label="WordPress">

Enter ids as a string delimited by pipe: `123|123`

```plaintext
[zooza type="calendar" filter_courses="YOUR_COURSE_ID"]
```

  </TabItem>
</Tabs>

### `course_id`

_Type: String_

Pass any valid course_id, or array of course_ids delimited by pipe character `|`.

**In URL Query**

| Value | Description | Example Value |
|---|---|---|
| `YOUR_COURSE_ID` | Course ID or list of course IDs delimited by pipe. | `123` |

```plaintext
https://sample-site.com/calendar?course_id=YOUR_COURSE_ID
```

### `place_id`

_Type: String_

Presets the active location in the location selection. You don't need to provide room_id, although place_id is required in order for room_id to work properly. You can also submit array of place_ids delimited by pipe character `|`.

**In URL Query**

| Value | Description | Example Value |
|---|---|---|
| `YOUR_PLACE_ID` | Place id or list of place ids delimited by pipe. | `123` |

```plaintext
https://sample-site.com/calendar?place_id=YOUR_PLACE_ID
```

### `hide_filter_course`

_Type: Bool_

Overrides widget's setting and hides the calendar filter.

```javascript
<script>
    window.ZOOZA = {
        hide_filter_course: true|false
    }
</script>
```

## Events

### `event_tile_render`

Minor customisations can be achieved by targeting individual tile's elements and hiding them via CSS. Should you require more precise or heavier customisation, you can provide callback to calendar renderer and customise the tile by yourself.

The callback will pass two arguments: `data` — object representation of tile's data; and HTML structure that will be inserted to the DOM.

The callback expects only the HTML code as return value. There's no further processing by the calendar — the HTML goes straight into the output.

```javascript
<script>
  const trainers = [...];

  window.ZOOZA = {
    callback: {
      event_tile_render: ( data, html ) => {
        console.log(data);
        trainers.forEach( ( trainer ) => {
          if( t.zooza_id === data.trainer_id ) {
                // do your stuff, insert HTML, remove node, etc.
          }
        } );
        return html;
      }
    }
};
</script>
```

## Import your own sessions

If you need to merge multiple data sources into the calendar, you can do that by importing the data at page load via JS property.

### Adding locations

| Parameter | Mandatory | Note |
|---|---|---|
| `place_id` | yes | Unique ID that cannot be the same as in Zooza |
| `room_id` | yes | Unique ID that cannot be the same as in Zooza. You can provide 0 if you don't require rooms. |
| `name` | yes | Name of the place |
| `region` | no | Name of the region/neighborhood. |

**Example**

```javascript
<script type='text/javascript'>
var zooza_places = [{
    place_id : 50,
    room_id : 25,
    name : 'Main street',
    region : 'Downtown'
  }];
</script>
```

### Adding sessions

| Parameter | Mandatory | Note |
|---|---|---|
| `place_id` | yes | This is the place_id used to filter the tiles. Place id has to be valid and be either pulled from zooza, or imported in previous step. |
| `room_id` | no | Same rules apply as for place_id. |
| `schedule_id` | no | Schedule/Group ID in Zooza or your external registration system |
| `event_id` | no | Event/Lesson ID in Zooza or your external registration system |
| `course_id` | no | Course ID in Zooza or your external registration system |
| `name` | yes | Name of the course |
| `class_name` | no | CSS class name applied to event's tile |
| `url` | yes | URL to more information about the course (landing page). In case of courses managed in Zooza, this is pulled from Courses.url property |
| `registration_url` | no | URL to custom registration form |
| `time` | no | Time of the beginning of the lesson in HH:mm (H:i) |
| `date_start` | yes | Date of start of the course in YYYY-MM-DD format (Y-m-d) |
| `date_end` | no | Date of the end of the course in YYYY-MM-DD format (Y-m-d) |
| `trainer` | no | Name of lecturer |
| `capacity` | no | Total capacity of group |
| `capacity_left` | no | How many places are left to register |
| `event_count` | no | Count of the events in the group |

**Example**

```javascript
<script type='text/javascript'>
var zooza_events = [{
    place_id : 50,
    room_id : 25,
    schedule_id : null,
    event_id : null,
    name : 'Test',
    class_name : 'schedule_51',
    url : 'https://www.yoursite.com',
    registration_url : 'https://www.yoursite.com/registration',
    time : '09:50',
    date_start : '2019-09-12',
    date_end : '2019-12-12',
    course_id: 44,
    trainer : 'Henri Miro',
    capacity : 8,
    event_count: 1,
    capacity_left: 10
  }];
</script>
```
