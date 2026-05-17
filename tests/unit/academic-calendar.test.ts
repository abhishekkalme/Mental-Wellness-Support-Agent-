import {
  getEventPosition,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  PRIORITY_COLORS,
  TIME_SLOTS,
  HOUR_HEIGHT,
} from '@/lib/types';
import {
  createEventSchema,
  updateEventSchema,
  createSemesterSchema,
} from '@/schemas/academic-calendar';

describe('Calendar Types & Helpers', () => {
  describe('getEventPosition', () => {
    it('calculates top position correctly for 9:00 AM', () => {
      const pos = getEventPosition('09:00');
      expect(pos.top).toBe(2 * HOUR_HEIGHT);
    });

    it('calculates top for 7:00 AM (first slot)', () => {
      const pos = getEventPosition('07:00');
      expect(pos.top).toBe(0);
    });

    it('calculates height from duration', () => {
      const pos = getEventPosition('09:00', '10:30');
      expect(pos.height).toBe(1.5 * HOUR_HEIGHT);
    });

    it('defaults to one hour when no endTime', () => {
      const pos = getEventPosition('10:00');
      expect(pos.height).toBe(HOUR_HEIGHT);
    });

    it('handles minutes correctly', () => {
      const pos = getEventPosition('09:30', '11:15');
      expect(pos.top).toBe(2.5 * HOUR_HEIGHT);
      expect(pos.height).toBe(1.75 * HOUR_HEIGHT);
    });

    it('never returns negative top', () => {
      const pos = getEventPosition('05:00');
      expect(pos.top).toBe(0);
    });

    it('minimum height of 20px', () => {
      const pos = getEventPosition('09:00', '09:05');
      expect(pos.height).toBeGreaterThanOrEqual(20);
    });
  });

  describe('EVENT_TYPE_COLORS', () => {
    it('has colors for all event types', () => {
      const types = Object.keys(EVENT_TYPE_LABELS);
      for (const type of types) {
        expect(EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS]).toBeDefined();
        expect(EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS]).toMatch(
          /^#[0-9a-fA-F]{6}$/
        );
      }
    });
  });

  describe('EVENT_TYPE_LABELS', () => {
    it('has labels for all event types', () => {
      const types = Object.keys(EVENT_TYPE_COLORS);
      for (const type of types) {
        expect(EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS]).toBeDefined();
        expect(EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS].length).toBeGreaterThan(0);
      }
    });
  });

  describe('PRIORITY_COLORS', () => {
    it('has colors for all priorities', () => {
      for (const p of ['low', 'medium', 'high', 'critical']) {
        expect(PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe('TIME_SLOTS', () => {
    it('starts at 7 AM and has 13 slots', () => {
      expect(TIME_SLOTS.length).toBe(13);
      expect(TIME_SLOTS[0].hour).toBe(7);
      expect(TIME_SLOTS[0].label).toBe('7 AM');
    });

    it('handles 12 PM correctly', () => {
      const noon = TIME_SLOTS.find((s) => s.hour === 12);
      expect(noon?.label).toBe('12 PM');
    });
  });
});

describe('Academic Calendar Zod Schemas', () => {
  describe('createEventSchema', () => {
    it('validates a minimal valid event', () => {
      const result = createEventSchema.safeParse({
        title: 'Math Exam',
        eventType: 'exam',
        startDate: '2026-06-15',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const result = createEventSchema.safeParse({
        title: '',
        eventType: 'exam',
        startDate: '2026-06-15',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid event type', () => {
      const result = createEventSchema.safeParse({
        title: 'Test',
        eventType: 'invalid-type',
        startDate: '2026-06-15',
      });
      expect(result.success).toBe(false);
    });

    it('applies defaults', () => {
      const result = createEventSchema.parse({
        title: 'Test',
        eventType: 'lecture',
        startDate: '2026-06-15',
      });
      expect(result.allDay).toBe(true);
      expect(result.recurrence).toBe('none');
      expect(result.priority).toBe('medium');
      expect(result.status).toBe('scheduled');
      expect(result.reminders).toEqual([]);
      expect(result.tags).toEqual([]);
    });

    it('validates full event with all fields', () => {
      const result = createEventSchema.safeParse({
        title: 'Final Exam',
        description: 'Comprehensive final covering all chapters',
        eventType: 'exam',
        startDate: '2026-06-20',
        endDate: '2026-06-20',
        allDay: false,
        startTime: '09:00',
        endTime: '12:00',
        location: 'Room 301',
        course: 'CS 101',
        courseCode: 'CS101',
        priority: 'high',
        recurrence: 'none',
        tags: ['final', 'cs'],
        reminders: [{ time: 60, type: 'notification' }],
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid time format', () => {
      const result = createEventSchema.safeParse({
        title: 'Test',
        eventType: 'lecture',
        startDate: '2026-06-15',
        startTime: '9:00',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid color format', () => {
      const result = createEventSchema.safeParse({
        title: 'Test',
        eventType: 'lecture',
        startDate: '2026-06-15',
        color: 'not-a-color',
      });
      expect(result.success).toBe(false);
    });

    it('validates all valid event types', () => {
      const types = [
        'exam',
        'deadline',
        'lecture',
        'holiday',
        'assignment',
        'internal-assessment',
        'registration',
        'fee-deadline',
        'result',
        'faculty-event',
        'department-event',
        'office-hours',
        'study-group',
        'personal',
      ];
      for (const type of types) {
        const result = createEventSchema.safeParse({
          title: 'Test',
          eventType: type,
          startDate: '2026-06-15',
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('updateEventSchema', () => {
    it('allows partial updates', () => {
      const result = updateEventSchema.safeParse({ title: 'Updated Title' });
      expect(result.success).toBe(true);
    });

    it('allows empty object (no-op)', () => {
      const result = updateEventSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('validates fields if provided', () => {
      const result = updateEventSchema.safeParse({ eventType: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('createSemesterSchema', () => {
    it('validates a valid semester', () => {
      const result = createSemesterSchema.safeParse({
        name: 'Fall 2026',
        academicYear: '2026-2027',
        startDate: '2026-09-01',
        endDate: '2026-12-20',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = createSemesterSchema.safeParse({ name: 'Fall' });
      expect(result.success).toBe(false);
    });

    it('defaults isActive to false', () => {
      const result = createSemesterSchema.parse({
        name: 'Fall 2026',
        academicYear: '2026-2027',
        startDate: '2026-09-01',
        endDate: '2026-12-20',
      });
      expect(result.isActive).toBe(false);
    });
  });
});

describe('Event Type Enum', () => {
  it('EVENT_TYPE_COLORS and EVENT_TYPE_LABELS have same keys', () => {
    const colorKeys = Object.keys(EVENT_TYPE_COLORS).sort();
    const labelKeys = Object.keys(EVENT_TYPE_LABELS).sort();
    expect(colorKeys).toEqual(labelKeys);
  });
});
