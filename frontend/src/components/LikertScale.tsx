import { Button } from './Button';

type LikertStatus = 'pass' | 'consider' | 'borderline' | 'fail';

interface LikertOption {
  value: number;
  title: string;
  description: string;
  status: LikertStatus;
}

const OPTIONS: LikertOption[] = [
  { value: 1, title: '1 — Exceptional', description: 'Outstanding fit', status: 'pass' },
  { value: 2, title: '2 — Strong', description: 'Ready to move forward', status: 'pass' },
  { value: 3, title: '3 — Consider', description: 'Needs more review', status: 'consider' },
  { value: 4, title: '4 — Borderline', description: 'Significant risks', status: 'borderline' },
  { value: 5, title: '5 — Fail', description: 'Does not meet expectations', status: 'fail' },
];

const STATUS_STYLES: Record<LikertStatus, string> = {
  pass: 'border-green-200 text-green-800 bg-green-50',
  consider: 'border-amber-200 text-amber-800 bg-amber-50',
  borderline: 'border-orange-200 text-orange-800 bg-orange-50',
  fail: 'border-red-200 text-red-800 bg-red-50',
};

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  onClear?: () => void;
}

export function LikertScale({ value, onChange, onClear }: LikertScaleProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {OPTIONS.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                STATUS_STYLES[option.status]
              } ${isActive ? 'ring-2 ring-offset-2 ring-blue-500 border-blue-400 bg-white shadow-sm' : ''}`}
            >
              <span className="text-xl font-semibold">{option.value}</span>
              <span className="text-sm font-medium">{option.title}</span>
              <span className="text-xs text-gray-600">{option.description}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          1–2 = Passed · 3 = For consideration · 4 = Borderline fail · 5 = Failed
        </p>
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear} type="button">
            Clear rating
          </Button>
        )}
      </div>
    </div>
  );
}
