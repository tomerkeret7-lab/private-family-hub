export function generateICS(
    title: string,
    description: string,
    eventDate: Date
): string {
    // Event duration (default 1 hour for now)
    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000);

    const formatDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FamilyHub//BulletinBoard//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${generateUID()}`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(eventDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${escapeICSString(title)}`,
        `DESCRIPTION:${escapeICSString(description)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
}

function generateUID(): string {
    return Math.random().toString(36).substring(2) + '@familyhub.local';
}

function escapeICSString(str: string): string {
    // ICS requires escaping commas, semicolons, and newlines
    return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
