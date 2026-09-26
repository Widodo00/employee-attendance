import { BeatLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="flex justify-center items-center fixed z-index bg-gray-200 opacity-80 inset-x-0 inset-y-0">
      <BeatLoader size={45} color="#2563eb" />
    </div>
  );
};

export default Loading;
