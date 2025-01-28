// session-manager.js

// 提醒時間設定（分鐘）
export const reminderOffsets = [
    { minutes: 10, message: '10 分鐘' },
    { minutes: 5, message: '5 分鐘' },
    { minutes: 1, message: '1 分鐘' },
    { minutes: 0, message: '時間到' }
];

export class SessionManager {
    constructor() {
        this.sessions = [];
    }

    // 解析時間字串為 Date 物件
    parseTimeString(timeStr) {
        const cleanTime = timeStr.replace(/上午|下午/g, '').trim();
        const [hours, minutes] = cleanTime.split(':').map(Number);
        const isPM = timeStr.includes('下午') && hours < 12;
        
        const date = new Date();
        date.setHours(isPM ? hours + 12 : hours);
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);
        
        return date;
    }

    // 驗證時間格式
    validateTimeFormat(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    // 添加單個場次
    addSession(time) {
        if (!this.validateTimeFormat(time)) {
            throw new Error('無效的時間格式');
        }

        if (this.sessions.some(session => session.endTime === time)) {
            throw new Error('此時間已存在');
        }

        this.sessions.push({ endTime: time });
        this.sessions.sort((a, b) => a.endTime.localeCompare(b.endTime));
        return true;
    }

    // 批量添加場次
    addMultipleSessions(times) {
        const invalidTimes = times.filter(time => !this.validateTimeFormat(time));
        if (invalidTimes.length > 0) {
            throw new Error(`無效的時間格式：${invalidTimes.join(', ')}`);
        }

        times.forEach(time => {
            try {
                this.addSession(time);
            } catch (error) {
                if (error.message !== '此時間已存在') {
                    throw error;
                }
            }
        });
    }

    // 刪除特定場次
    deleteSession(time) {
        const initialLength = this.sessions.length;
        this.sessions = this.sessions.filter(session => session.endTime !== time);
        return this.sessions.length !== initialLength;
    }

    // 清除所有場次
    clearAllSessions() {
        this.sessions = [];
        return true;
    }

    // 計算時間差
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

    // 獲取所有場次
    getSessions() {
        return [...this.sessions];
    }

    // 格式化倒數時間
    formatCountdown(timeObj) {
        if (timeObj.isExpired) return '0時0分0秒';
        if (timeObj.total < 0) return '0時0分0秒';
        return `${timeObj.hours}時${timeObj.minutes}分${timeObj.seconds}秒`;
    }

    // 計算提醒時間
    calculateReminderTimes(sessionTime) {
        return reminderOffsets.map(offset => {
            const [hours, minutes] = sessionTime.split(':').map(Number);
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);
            reminderTime.setMinutes(reminderTime.getMinutes() - offset.minutes);
            
            return {
                time: reminderTime.toLocaleTimeString('zh-TW', {
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
