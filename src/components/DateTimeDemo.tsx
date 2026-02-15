import React from 'react';
import { useDateTime } from '@/hooks/useDateTime';

export const DateTimeDemo: React.FC = () => {
  const now = new Date();
  const isoString = '2026-02-14T08:18:06.767Z';

  const formattedLocal = useDateTime(isoString);
  const formattedUTC = useDateTime(isoString, { useUTC: true, formatStr: 'yyyy-MM-dd HH:mm:ss' });
  const relativeTime = useDateTime(isoString, { relative: true });
  const customFormat = useDateTime(now, { formatStr: 'EEEE, MMMM do, yyyy' });

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-slate-50">
      <h2 className="text-xl font-bold">DateTime Hook Demo</h2>
      <div>
        <p className="font-semibold">Input ISO:</p>
        <code className="bg-gray-200 px-1">{isoString}</code>
      </div>
      <div>
        <p className="font-semibold">Local (Default):</p>
        <span>{formattedLocal}</span>
      </div>
      <div>
        <p className="font-semibold">UTC (Custom Format):</p>
        <span>{formattedUTC} (UTC)</span>
      </div>
      <div>
        <p className="font-semibold">Relative:</p>
        <span>{relativeTime}</span>
      </div>
      <div>
        <p className="font-semibold">Custom Format (Now):</p>
        <span>{customFormat}</span>
      </div>
    </div>
  );
};
