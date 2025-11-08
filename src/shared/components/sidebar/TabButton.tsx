export const TabCount = ({ label, count }: { label: string, count: number }) => {
  return (
    <div
      className="flex-1 rounded-md py-1 text-xs transition-all duration-200 bg-transparent border-transparent"
    >
      <span className="block font-bold text-md text-gray-800">{count}</span>
      <span className="capitalize text-[8px] text-gray-600">{label}</span>
    </div>
  );
};
