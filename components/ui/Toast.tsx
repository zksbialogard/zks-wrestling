type Props = {
  message: string;
};

export default function Toast({
  message,
}: Props) {
  return (
    <div
      className="
      fixed
      bottom-6
      right-6
      bg-green-600
      px-6
      py-4
      rounded-xl
      text-white
      shadow-xl
      "
    >
      {message}
    </div>
  );
}