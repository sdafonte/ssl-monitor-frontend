import { cn } from '../../utils/cn';

interface HealthScoreBadgeProps {
  grade: string;
}

const gradeColors: { [key: string]: string } = {
  'A+': 'bg-green-500 text-white',
  'A': 'bg-green-600 text-white',
  'B': 'bg-blue-500 text-white',
  'C': 'bg-yellow-500 text-black',
  'D': 'bg-orange-500 text-white',
  'F': 'bg-red-600 text-white',
};

export const HealthScoreBadge = ({ grade }: HealthScoreBadgeProps) => {
  const colorClasses = gradeColors[grade] || 'bg-gray-500 text-white';

  return (
    <div className={cn(
      'flex items-center justify-center h-12 w-12 rounded-full font-bold text-xl border-2 border-white/20',
      colorClasses
    )}>
      {grade}
    </div>
  );
};