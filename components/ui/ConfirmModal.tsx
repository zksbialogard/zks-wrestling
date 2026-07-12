import Modal, { ModalBody, ModalFooter, ModalHeader } from "./Modal";

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
      <ModalHeader>
        <h2 className="text-3xl font-bold text-yellow-400">{title}</h2>
      </ModalHeader>

      <ModalBody>
        <p className="text-gray-400">{description}</p>
      </ModalBody>

      <ModalFooter>
        <button onClick={onCancel} className="rounded-xl bg-zinc-800 px-5 py-2">
          Anuluj
        </button>

        <button onClick={onConfirm} className="rounded-xl bg-red-600 px-5 py-2">
          Usuń
        </button>
      </ModalFooter>
    </Modal>
  );
}
