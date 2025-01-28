# Session Time Reminder | 時間提醒系統

A web-based time management system for tracking multiple session end times with automated reminders. This application helps users manage various sessions by providing visual countdown timers and alerts at specified intervals.

## Features

- **Session Management**
    - Add individual session end times
    - Batch add multiple sessions using comma-separated time inputs
    - Delete individual sessions or clear all sessions
    - Sort sessions chronologically

- **Time Tracking**
    - Real-time countdown display for each session
    - Current time display
    - Automatic updates every second

- **Reminder System**
    - Automated reminders at multiple intervals:
        - 10 minutes before end time
        - 5 minutes before end time
        - 1 minute before end time
        - At end time
    - Visual status indicators:
        - White: More than 30 seconds until reminder
        - Red: Within 30 seconds of reminder time
        - Gray: Expired reminder

- **Language Support**
    - Bilingual interface (Traditional Chinese and English)
    - Language toggle with persistent settings
    - Localized time formats and messages

## Technical Details

### Dependencies

- Bootstrap 5.3.2
- Bootstrap Icons 1.11.1

### Core Components

- `session-manager.js`: Core logic for session management and time calculations
- `index.html`: User interface and application initialization

### Time Format

- Uses 24-hour format (HH:MM) for input
- Displays time in localized format based on selected language
    - Chinese: 12-hour format with AM/PM (上午/下午)
    - English: 12-hour format with AM/PM

## Usage

1. **Language Selection**
    - Toggle between Chinese and English using the language button in the top-right corner
    - Interface updates immediately to reflect selected language

2. **Adding Sessions**
    - Single session:
        - Enter time in the time input field
        - Click "Add Single Session" (English) / "新增單一場次" (Chinese)
    - Multiple sessions:
        - Enter comma-separated times in the preset field
        - Click "Add Multiple Sessions" (English) / "新增多個場次" (Chinese)

3. **Managing Sessions**
    - Remove individual sessions using the trash icon
    - Clear all sessions using the "Clear All" (English) / "清除全部" (Chinese) button

4. **Monitoring Time**
    - View countdown timers for each session
    - Check reminder status through color-coded cards
    - Track current time in the header

## Browser Compatibility

The application uses modern JavaScript features and should be compatible with:
- Chrome
- Firefox
- Safari
- Edge

## License

[[LICENSE]]