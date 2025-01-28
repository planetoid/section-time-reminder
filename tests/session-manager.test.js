// session-manager.test.js

import { SessionManager, reminderOffsets } from '../modules/session-manager';

describe('SessionManager', () => {
    let manager;

    beforeEach(() => {
        manager = new SessionManager();
    });

    describe('時間格式驗證', () => {
        test('應該接受有效的時間格式', () => {
            expect(manager.validateTimeFormat('13:30')).toBe(true);
            expect(manager.validateTimeFormat('09:00')).toBe(true);
            expect(manager.validateTimeFormat('23:59')).toBe(true);
        });

        test('應該拒絕無效的時間格式', () => {
            expect(manager.validateTimeFormat('25:00')).toBe(false);
            expect(manager.validateTimeFormat('13:60')).toBe(false);
            expect(manager.validateTimeFormat('9:5')).toBe(false);
            expect(manager.validateTimeFormat('abc')).toBe(false);
        });
    });

    describe('場次管理', () => {
        test('應該能夠添加有效的場次', () => {
            expect(manager.addSession('13:30')).toBe(true);
            expect(manager.getSessions()).toHaveLength(1);
            expect(manager.getSessions()[0].endTime).toBe('13:30');
        });

        test('不應該添加重複的場次', () => {
            manager.addSession('13:30');
            expect(() => manager.addSession('13:30')).toThrow('此時間已存在');
        });

        test('應該按時間順序排序場次', () => {
            manager.addSession('14:30');
            manager.addSession('13:30');
            manager.addSession('15:30');
            
            const sessions = manager.getSessions();
            expect(sessions[0].endTime).toBe('13:30');
            expect(sessions[1].endTime).toBe('14:30');
            expect(sessions[2].endTime).toBe('15:30');
        });

        test('應該能夠刪除特定場次', () => {
            manager.addSession('13:30');
            expect(manager.deleteSession('13:30')).toBe(true);
            expect(manager.getSessions()).toHaveLength(0);
        });

        test('應該能夠清除所有場次', () => {
            manager.addSession('13:30');
            manager.addSession('14:30');
            expect(manager.clearAllSessions()).toBe(true);
            expect(manager.getSessions()).toHaveLength(0);
        });
    });

    describe('批量添加場次', () => {
        test('應該能夠批量添加有效的場次', () => {
            const times = ['13:30', '14:30', '15:30'];
            manager.addMultipleSessions(times);
            expect(manager.getSessions()).toHaveLength(3);
        });

        test('應該在批量添加時拒絕無效的時間格式', () => {
            const times = ['13:30', '24:00', '14:30'];
            expect(() => manager.addMultipleSessions(times))
                .toThrow('無效的時間格式：24:00');
        });
    });

    describe('時間計算', () => {
        test('應該正確解析時間字串', () => {
            const time = '13:30';
            const parsed = manager.parseTimeString(time);
            expect(parsed.getHours()).toBe(13);
            expect(parsed.getMinutes()).toBe(30);
            expect(parsed.getSeconds()).toBe(0);
        });

        test('應該正確處理已過期的時間', () => {
            const pastTime = new Date();
            pastTime.setHours(pastTime.getHours() - 1);
            const timeStr = `${pastTime.getHours()}:${pastTime.getMinutes()}`;
            
            const remaining = manager.getTimeRemaining(timeStr);
            expect(remaining.isExpired).toBe(false);
            expect(remaining.total).toBeGreaterThan(0);
        });
    });

    describe('格式化', () => {
        test('應該正確格式化倒數時間', () => {
            const timeObj = {
                total: 3661000,
                hours: 1,
                minutes: 1,
                seconds: 1,
                isExpired: false
            };
            expect(manager.formatCountdown(timeObj)).toBe('1時1分1秒');
        });

        test('應該正確格式化過期時間', () => {
            const timeObj = {
                total: -1,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: true
            };
            expect(manager.formatCountdown(timeObj)).toBe('0時0分0秒');
        });
    });
});
