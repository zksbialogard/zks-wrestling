type Props = {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  description,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal>

      <h2 className="text-3xl text-yellow-400 font-bold">
        {title}
      </h2>

      <p className="text-gray-400 mt-5">
        {description}
      </p>

      <div className="flex justify-end gap-4 mt-10">

        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-xl bg-zinc-800"
        >
          Anuluj
        </button>

        <button
          onClick={onConfirm}
          className="px-5 py-2 rounded-xl bg-red-600"
        >
          Usuń
        </button>

      </div>

    </Modal>
  );
}

import Modal from "./Modal";