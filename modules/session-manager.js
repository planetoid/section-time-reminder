// session-manager.js

// Reminder time settings with translations
export const reminderOffsets = [
    {
        minutes: 10,
        message: {
            zh: '10 分鐘',
            en: '10 minutes'
        }
    },
    {
        minutes: 5,
        message: {
            zh: '5 分鐘',
            en: '5 minutes'
        }
    },
    {
        minutes: 1,
        message: {
            zh: '1 分鐘',
            en: '1 minute'
        }
    },
    {
        minutes: 0,
        message: {
            zh: '時間到',
            en: 'Time\'s up'
        }
    }
];

export class SessionManager {
    constructor() {
        this.sessions = [];
        this.errorMessages = {
            invalidFormat: {
                zh: '無效的時間格式',
                en: 'Invalid time format'
            },
            timeExists: {
                zh: '此時間已存在',
                en: 'This time already exists'
            },
            invalidTimes: {
                zh: '無效的時間格式：',
                en: 'Invalid time format: '
            }
        };
    }

    // Parse time string to Date object
    parseTimeString(timeStr) {
        const cleanTime = timeStr.replace(/上午|下午|AM|PM/g, '').trim();
        const [hours, minutes] = cleanTime.split(':').map(Number);
        const isPM = timeStr.includes('下午') || timeStr.includes('PM') && hours < 12;

        const date = new Date();
        date.setHours(isPM ? hours + 12 : hours);
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;
    }

    // Validate time format
    validateTimeFormat(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    // Add single session
    addSession(time) {
        const lang = window.currentLang;
        if (!this.validateTimeFormat(time)) {
            throw new Error(this.errorMessages.invalidFormat[lang]);
        }

        if (this.sessions.some(session => session.endTime === time)) {
            throw new Error(this.errorMessages.timeExists[lang]);
        }

        this.sessions.push({ endTime: time });
        this.sessions.sort((a, b) => a.endTime.localeCompare(b.endTime));
        return true;
    }

    // Add multiple sessions
    addMultipleSessions(times) {
        const lang = window.currentLang;
        const invalidTimes = times.filter(time => !this.validateTimeFormat(time));
        if (invalidTimes.length > 0) {
            throw new Error(`${this.errorMessages.invalidTimes[lang]}${invalidTimes.join(', ')}`);
        }

        times.forEach(time => {
            try {
                this.addSession(time);
            } catch (error) {
                if (error.message !== this.errorMessages.timeExists[lang]) {
                    throw error;
                }
            }
        });
    }

    // Delete specific session
    deleteSession(time) {
        const initialLength = this.sessions.length;
        this.sessions = this.sessions.filter(session => session.endTime !== time);
        return this.sessions.length !== initialLength;
    }

    // Clear all sessions
    clearAllSessions() {
        this.sessions = [];
        return true;
    }

    // Calculate time difference
    getTimeRemaining(futureTimeStr) {
        const now = new Date();
        const future = this.parseTimeString(futureTimeStr);

        if (future < now) {
            future.setDate(future.getDate() + 1);
        }

        const diff = future - now;

        if (diff < 0) {
            return {
                total: diff,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: true
            };
        }

        return {
            total: diff,
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            isExpired: false
        };
    }

    // Get all sessions
    getSessions() {
        return [...this.sessions];
    }

    // Format countdown time for both languages
    formatCountdown(timeObj) {
        const lang = window.currentLang;
        const formats = {
            zh: {
                hour: '時',
                minute: '分',
                second: '秒'
            },
            en: {
                hour: 'h ',
                minute: 'm ',
                second: 's'
            }
        };

        if (timeObj.isExpired || timeObj.total < 0) {
            return lang === 'zh' ? '0時0分0秒' : '0h 0m 0s';
        }

        const f = formats[lang];
        return `${timeObj.hours}${f.hour}${timeObj.minutes}${f.minute}${timeObj.seconds}${f.second}`;
    }

    // Calculate reminder times
    calculateReminderTimes(sessionTime) {
        const locale = window.currentLang === 'zh' ? 'zh-TW' : 'en-US';

        return reminderOffsets.map(offset => {
            const [hours, minutes] = sessionTime.split(':').map(Number);
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);
            reminderTime.setMinutes(reminderTime.getMinutes() - offset.minutes);

            return {
                time: reminderTime.toLocaleTimeString(locale, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                message: offset.message,
                countdown: {
                    total: reminderTime - new Date(),
                    hours: Math.floor((reminderTime - new Date()) / (1000 * 60 * 60)),
                    minutes: Math.floor(((reminderTime - new Date()) % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor(((reminderTime - new Date()) % (1000 * 60)) / 1000)
                }
            };
        });
    }
}