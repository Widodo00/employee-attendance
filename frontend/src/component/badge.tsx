interface badgeInterface {
  type: number;
  content: string;
}

export default function Badge({ content, type }: badgeInterface) {
  return (
    <div
      className={`py-1 px-2.5 flex w-fit gap-1.5 border font-medium text-xs rounded-full items-center ${type === 0 ? "border-[#FFD6A8] bg-bg-warning text-text-warning" : type === 1 ? "border-[#B9F8CF] bg-bg-success text-text-success" : "border-#BEDBFF bg-bg-neutral text-text-neutral"}`}
    >
      <div className={`size-1.5 rounded-full ${type === 0 ? "bg-icon-warning" : type === 1 ? "bg-icon-success" : "bg-icon-neutral"}`} />
      <p>{content}</p>
    </div>
  );
}
